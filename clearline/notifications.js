(function () {
  'use strict';

  const script = document.currentScript;
  const endpoint = script?.dataset.endpoint || '';
  const sentKey = 'clearline_notification_ids';

  function readSentIds() {
    try {
      return JSON.parse(sessionStorage.getItem(sentKey)) || [];
    } catch {
      return [];
    }
  }

  async function notify(name, options = {}) {
    if (!endpoint) return false;

    const id = options.id || `${name}:${window.location.pathname}`;
    const sentIds = readSentIds();
    if (sentIds.includes(id)) return true;

    const isAudit = name === 'audit_form_submission';
    const title = isAudit ? 'New Clearline audit lead' : 'New Clearline inquiry';
    const message = isAudit
      ? 'A visitor completed the homepage audit form and reached the email handoff.'
      : 'A visitor completed the project inquiry form and reached the email handoff.';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'Title': title,
          'Priority': isAudit ? 'high' : 'default',
          'Tags': isAudit ? 'mag,bar_chart' : 'briefcase,bar_chart'
        },
        body: message,
        keepalive: true,
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Notification failed: ${response.status}`);
      sessionStorage.setItem(sentKey, JSON.stringify([...sentIds, id].slice(-20)));
      window.clearlineAnalytics?.track('lead_notification_sent', { type: name });
      return true;
    } catch {
      window.clearlineAnalytics?.track('lead_notification_failed', { type: name });
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  window.clearlineNotifications = { notify };
}());
