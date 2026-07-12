(function () {
  'use strict';

  const feed = 'https://ntfy.sh/clearline-analytics-6f8d2c1a/json?poll=1&since=all';
  const refreshInterval = 30000;
  let refreshTimer;
  let loading = false;
  const labels = {
    homepage_view: 'Homepage viewed',
    audit_landing_view: 'Audit landing page viewed',
    blog_index_view: 'Blog index viewed',
    blog_post_view: 'Blog post viewed',
    audit_form_submission: 'Audit form completed',
    audit_email_opened: 'Prepared audit email opened',
    audit_email_copied: 'Prepared audit request copied',
    audit_cta_clicked: 'Hero audit CTA clicked',
    audit_referral_shared: 'Audit offer shared',
    audit_referral_copied: 'Audit referral link copied',
    contact_form_submission: 'Project inquiry completed',
    contact_email_opened: 'Prepared project email opened',
    contact_email_copied: 'Prepared project request copied',
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

  function utcDay(timestamp) {
    return new Date(timestamp).toISOString().slice(0, 10);
  }

  function describeChange(current, previous) {
    if (!previous && !current) return 'No activity yesterday';
    if (!previous) return 'Up from 0 yesterday';
    const change = ((current - previous) / previous) * 100;
    if (!change) return 'Same as yesterday';
    return `${change > 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(0)}% vs yesterday`;
  }

  async function loadMetrics() {
    if (loading) return;
    loading = true;
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
      const uniqueCount = (name, sourceEvents = events) => {
        const matching = sourceEvents.filter((event) => event.name === name);
        return new Set(matching.map((event) => event.sessionId || `legacy:${event.id || event.timestamp}`)).size;
      };
      const uniqueCountAcross = (names, sourceEvents = events) => new Set(
        sourceEvents
          .filter((event) => names.includes(event.name))
          .map((event) => event.sessionId || `legacy:${event.id || event.timestamp}`)
      ).size;
      const homepageViews = uniqueCount('homepage_view');
      const auditLandingViews = uniqueCount('audit_landing_view');
      const auditEntryViews = uniqueCountAcross(['homepage_view', 'audit_landing_view']);
      const auditClicks = count('audit_cta_clicked');
      const audits = count('audit_form_submission');
      setText('homepage-views', homepageViews);
      setText('audit-landing-views', auditLandingViews);
      setText('blog-views', uniqueCountAcross(['blog_index_view', 'blog_post_view']));
      setText('audit-clicks', auditClicks);
      setText('audit-submissions', audits);
      setText('audit-opened', count('audit_email_opened'));
      setText('audit-copied', count('audit_email_copied'));
      setText('newsletter-signups', count('newsletter_signup'));
      setText('audit-rate', auditEntryViews ? `${((audits / auditEntryViews) * 100).toFixed(1)}%` : '—');

      const now = new Date();
      const todayKey = utcDay(now);
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayKey = utcDay(yesterday);
      const eventsOn = (day) => events.filter((event) => utcDay(event.timestamp) === day);
      const dailyCount = (dailyEvents, names) => dailyEvents.filter((event) => names.includes(event.name)).length;
      const dailyUniqueCount = (dailyEvents, names) => new Set(
        dailyEvents
          .filter((event) => names.includes(event.name))
          .map((event) => event.sessionId || `legacy:${event.id || event.timestamp}`)
      ).size;
      const todayEvents = eventsOn(todayKey);
      const yesterdayEvents = eventsOn(yesterdayKey);
      const entryNames = ['homepage_view', 'audit_landing_view'];
      const todayEntries = dailyUniqueCount(todayEvents, entryNames);
      const yesterdayEntries = dailyUniqueCount(yesterdayEvents, entryNames);
      const todayClicks = dailyCount(todayEvents, ['audit_cta_clicked']);
      const yesterdayClicks = dailyCount(yesterdayEvents, ['audit_cta_clicked']);
      const todayAudits = dailyCount(todayEvents, ['audit_form_submission']);
      const yesterdayAudits = dailyCount(yesterdayEvents, ['audit_form_submission']);
      const todayRate = todayEntries ? (todayAudits / todayEntries) * 100 : null;
      const yesterdayRate = yesterdayEntries ? (yesterdayAudits / yesterdayEntries) * 100 : null;
      setText('daily-date', new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(now));
      setText('today-entry-visits', todayEntries);
      setText('today-audit-clicks', todayClicks);
      setText('today-audit-submissions', todayAudits);
      setText('today-audit-rate', todayRate === null ? '—' : `${todayRate.toFixed(1)}%`);
      setText('entry-comparison', describeChange(todayEntries, yesterdayEntries));
      setText('click-comparison', describeChange(todayClicks, yesterdayClicks));
      setText('submission-comparison', describeChange(todayAudits, yesterdayAudits));
      setText('rate-comparison', todayRate === null || yesterdayRate === null
        ? 'Needs visits on both days'
        : describeChange(todayRate, yesterdayRate));

      const funnel = [
        ['Audit entry visits', auditEntryViews],
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
      events.filter((event) => ['homepage_view', 'audit_landing_view', 'blog_index_view', 'blog_post_view'].includes(event.name)).forEach((event) => {
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
      loading = false;
      refresh.disabled = false;
    }
  }

  document.querySelector('#refresh').addEventListener('click', loadMetrics);
  function scheduleRefresh() {
    window.clearInterval(refreshTimer);
    if (document.hidden) {
      document.querySelector('#live-refresh').dataset.state = 'paused';
      document.querySelector('#live-refresh').lastChild.textContent = 'Live refresh paused';
      return;
    }
    document.querySelector('#live-refresh').dataset.state = 'live';
    document.querySelector('#live-refresh').lastChild.textContent = 'Live refresh on · 30s';
    refreshTimer = window.setInterval(loadMetrics, refreshInterval);
  }

  document.addEventListener('visibilitychange', () => {
    scheduleRefresh();
    if (!document.hidden) loadMetrics();
  });
  scheduleRefresh();
  loadMetrics();
}());
