(function () {
  'use strict';

  const storageKey = 'clearline_analytics_v1';
  const endpoint = document.currentScript?.dataset.endpoint || '';

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

  function track(name, properties = {}) {
    const timestamp = new Date().toISOString();
    const event = {
      name,
      properties,
      path: window.location.pathname,
      timestamp
    };

    saveLocally(name, timestamp);

    if (endpoint) {
      const payload = JSON.stringify(event);
      if (navigator.sendBeacon) {
        // text/plain is CORS-safelisted, so delivery also works from static hosts.
        navigator.sendBeacon(endpoint, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    }

    window.dispatchEvent(new CustomEvent('clearline:analytics', { detail: event }));
  }

  window.clearlineAnalytics = { track, readSummary };

  const pageType = document.body.dataset.analyticsPage;
  if (pageType) track(`${pageType}_view`);
}());
