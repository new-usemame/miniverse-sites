(function () {
  'use strict';

  const storageKey = 'clearline_analytics_v1';
  const queueKey = 'clearline_analytics_queue_v1';
  const endpoint = document.currentScript?.dataset.endpoint || '';
  let flushing = false;

  function readSummary() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { counts: {}, lastEventAt: null };
    } catch {
      return { counts: {}, lastEventAt: null };
    }
  }

  function saveLocally(name, timestamp) {
    const summary = readSummary();
    summary.counts[name] = (summary.counts[name] || 0) + 1;
    summary.lastEventAt = timestamp;
    try {
      localStorage.setItem(storageKey, JSON.stringify(summary));
    } catch {
      // Tracking must never interrupt the visitor's experience.
    }
  }

  function readQueue() {
    try {
      return JSON.parse(localStorage.getItem(queueKey)) || [];
    } catch {
      return [];
    }
  }

  function writeQueue(events) {
    try {
      localStorage.setItem(queueKey, JSON.stringify(events.slice(-50)));
    } catch {
      // Local analytics are optional and must not affect the page.
    }
  }

  function enqueue(event) {
    writeQueue([...readQueue(), event]);
  }

  async function deliver(event) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(event),
      keepalive: true
    });
    if (!response.ok) throw new Error(`Analytics endpoint returned ${response.status}`);
  }

  async function flushQueue() {
    if (!endpoint || flushing || !navigator.onLine) return;
    flushing = true;
    const pending = readQueue();
    let delivered = 0;

    try {
      for (const event of pending) {
        await deliver(event);
        delivered += 1;
      }
    } catch {
      // Keep this event and the remainder for the next page load or online event.
    } finally {
      if (delivered) {
        const deliveredIds = new Set(pending.slice(0, delivered).map((event) => event.id));
        writeQueue(readQueue().filter((event) => !deliveredIds.has(event.id)));
      }
      flushing = false;
      if (delivered === pending.length && readQueue().length) window.setTimeout(flushQueue, 0);
    }
  }

  function track(name, properties = {}) {
    const timestamp = new Date().toISOString();
    const event = {
      id: window.crypto?.randomUUID?.() || `${timestamp}:${Math.random().toString(36).slice(2)}`,
      name,
      properties,
      path: window.location.pathname,
      timestamp
    };

    saveLocally(name, timestamp);

    if (endpoint) {
      enqueue(event);
      flushQueue();
    }

    window.dispatchEvent(new CustomEvent('clearline:analytics', { detail: event }));
  }

  window.clearlineAnalytics = { track, readSummary };

  window.addEventListener('online', flushQueue);

  const pageType = document.body.dataset.analyticsPage;
  if (pageType) track(`${pageType}_view`);
  else flushQueue();
}());
