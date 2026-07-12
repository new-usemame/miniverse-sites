(function () {
  'use strict';

  const feed = 'https://ntfy.sh/clearline-analytics-6f8d2c1a/json?poll=1&since=all';
  const labels = {
    homepage_view: 'Homepage viewed',
    blog_post_view: 'Blog post viewed',
    audit_form_submission: 'Audit form completed',
    audit_email_opened: 'Prepared audit email opened',
    audit_cta_clicked: 'Hero audit CTA clicked',
    audit_referral_shared: 'Audit offer shared',
    audit_referral_copied: 'Audit referral link copied',
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

  function setCollectorHealth(state, title, detail) {
    document.querySelector('#collector-health').dataset.state = state;
    setText('health-title', title);
    setText('health-detail', detail);
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
      let readableRecords = 0;
      const events = lines.flatMap((line) => {
        try {
          const envelope = JSON.parse(line);
          const event = JSON.parse(envelope.message || '{}');
          readableRecords += 1;
          return labels[event.name] ? [event] : [];
        } catch {
          return [];
        }
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const ignoredRecords = readableRecords - events.length;
      setCollectorHealth(
        'connected',
        'Analytics collector connected',
        ignoredRecords
          ? `${ignoredRecords} diagnostic or unknown ${ignoredRecords === 1 ? 'record was' : 'records were'} ignored.`
          : 'The reporting feed responded successfully.'
      );

      const count = (name) => events.filter((event) => event.name === name).length;
      const homepageViews = count('homepage_view');
      const auditClicks = count('audit_cta_clicked');
      const audits = count('audit_form_submission');
      setText('homepage-views', homepageViews);
      setText('blog-views', count('blog_post_view'));
      setText('audit-clicks', auditClicks);
      setText('audit-submissions', audits);
      setText('audit-opened', count('audit_email_opened'));
      setText('newsletter-signups', count('newsletter_signup'));
      setText('audit-rate', homepageViews ? `${((audits / homepageViews) * 100).toFixed(1)}%` : '—');

      const funnel = [
        ['Homepage views', homepageViews],
        ['Audit CTA clicks', auditClicks],
        ['Audit forms completed', audits],
        ['Prepared emails opened', count('audit_email_opened')]
      ];
      document.querySelector('#funnel-list').replaceChildren(...funnel.map(([label, value], index) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        const result = document.createElement('b');
        name.textContent = label;
        const previous = index ? funnel[index - 1][1] : 0;
        result.textContent = index && previous ? `${value} · ${((value / previous) * 100).toFixed(1)}%` : String(value);
        item.append(name, result);
        return item;
      }));

      const sources = new Map();
      events.filter((event) => event.name === 'homepage_view' || event.name === 'blog_post_view').forEach((event) => {
        const source = event.properties?.source || event.properties?.referrer || 'Direct / unknown';
        sources.set(source, (sources.get(source) || 0) + 1);
      });
      const sourceRows = [...sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      const sourceList = document.querySelector('#source-list');
      sourceList.replaceChildren(...sourceRows.map(([source, value]) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        const result = document.createElement('b');
        name.textContent = source;
        result.textContent = value;
        item.append(name, result);
        return item;
      }));
      if (!sourceRows.length) sourceList.innerHTML = '<li>Waiting for attributed visits…</li>';

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
      setCollectorHealth('error', 'Analytics collector unavailable', 'The dashboard could not reach the reporting feed. Try refreshing in a moment.');
      status.textContent = 'Metrics are temporarily unavailable. No site forms or visitor experiences are affected.';
    } finally {
      refresh.disabled = false;
    }
  }

  document.querySelector('#refresh').addEventListener('click', loadMetrics);
  loadMetrics();
}());
