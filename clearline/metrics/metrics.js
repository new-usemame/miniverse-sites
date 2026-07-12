(function () {
  'use strict';

  const feed = 'https://ntfy.sh/clearline-analytics-6f8d2c1a/json?poll=1&since=all';
  const labels = {
    homepage_view: 'Homepage viewed',
    blog_post_view: 'Blog post viewed',
    audit_form_submission: 'Audit form completed',
    audit_email_opened: 'Prepared audit email opened',
    contact_form_submission: 'Project inquiry completed',
    contact_email_opened: 'Prepared project email opened',
    newsletter_signup: 'Newsletter signup started'
  };

  function setText(id, value) {
    document.querySelector(`#${id}`).textContent = value;
  }

  function formatTime(timestamp) {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
  }

  async function loadMetrics() {
    const status = document.querySelector('#status');
    const refresh = document.querySelector('#refresh');
    status.textContent = 'Refreshing activity…';
    refresh.disabled = true;

    try {
      const response = await fetch(feed, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Feed returned ${response.status}`);
      const lines = (await response.text()).trim().split('\n').filter(Boolean);
      const events = lines.flatMap((line) => {
        try {
          const envelope = JSON.parse(line);
          const event = JSON.parse(envelope.message || '{}');
          return labels[event.name] ? [event] : [];
        } catch {
          return [];
        }
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const count = (name) => events.filter((event) => event.name === name).length;
      const homepageViews = count('homepage_view');
      const audits = count('audit_form_submission');
      setText('homepage-views', homepageViews);
      setText('blog-views', count('blog_post_view'));
      setText('audit-submissions', audits);
      setText('audit-opened', count('audit_email_opened'));
      setText('newsletter-signups', count('newsletter_signup'));
      setText('audit-rate', homepageViews ? `${((audits / homepageViews) * 100).toFixed(1)}%` : '—');

      const list = document.querySelector('#activity-list');
      list.replaceChildren(...(events.slice(0, 8).map((event) => {
        const item = document.createElement('li');
        const name = document.createElement('b');
        const time = document.createElement('time');
        name.textContent = labels[event.name];
        time.dateTime = event.timestamp;
        time.textContent = formatTime(event.timestamp);
        item.append(name, time);
        return item;
      })));
      if (!events.length) list.innerHTML = '<li>No acquisition events retained yet.</li>';

      const oldest = events.at(-1)?.timestamp;
      status.textContent = oldest
        ? `Showing ${events.length} retained events since ${formatTime(oldest)}. Last refreshed ${formatTime(new Date().toISOString())}.`
        : 'Tracking is live. The dashboard will update after the next visit or conversion.';
    } catch {
      status.textContent = 'Metrics are temporarily unavailable. No site forms or visitor experiences are affected.';
    } finally {
      refresh.disabled = false;
    }
  }

  document.querySelector('#refresh').addEventListener('click', loadMetrics);
  loadMetrics();
}());
