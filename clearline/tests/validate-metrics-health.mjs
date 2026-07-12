import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, script, css] = await Promise.all([
  readFile(new URL('../metrics/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../metrics/metrics.js', import.meta.url), 'utf8'),
  readFile(new URL('../metrics/metrics.css', import.meta.url), 'utf8')
]);

for (const id of ['collector-health', 'health-title', 'health-detail', 'live-refresh', 'check-pipeline', 'pipeline-result']) {
  assert.match(html, new RegExp(`id="${id}"`), `metrics page should include #${id}`);
}

for (const id of ['homepage-views', 'audit-landing-views', 'audit-submissions', 'audit-copied', 'audit-rate']) {
  assert.match(html, new RegExp(`id="${id}"`), `metrics page should include #${id}`);
}

assert.match(script, /setCollectorHealth\(\s*'connected'/, 'successful feed requests should show a connected state');
assert.match(script, /setCollectorHealth\('error'/, 'failed feed requests should show an error state');
assert.match(script, /const refreshInterval = 30000/, 'the live dashboard should poll every 30 seconds');
assert.match(script, /document\.addEventListener\('visibilitychange'/, 'polling should respond to tab visibility');
assert.match(script, /if \(document\.hidden\)/, 'polling should pause while the dashboard is hidden');
assert.match(script, /if \(loading\) return/, 'overlapping feed requests should be prevented');
assert.match(script, /ignoredRecords = readableRecords - events\.length/, 'unknown and diagnostic records should be reported');
assert.match(script, /name: 'analytics_diagnostic'/, 'the pipeline check should send a non-acquisition diagnostic event');
assert.match(script, /\.id === id/, 'the pipeline check should verify that its exact event can be read back');
assert.match(script, /End-to-end tracking passed/, 'the dashboard should clearly report a successful pipeline check');
assert.match(css, /pipeline-check span\[data-state="success"\]/, 'successful end-to-end checks should be styled');
assert.match(script, /audit_landing_view: 'Audit landing page viewed'/, 'audit landing views should be recognized');
assert.match(script, /audit_email_copied: 'Prepared audit request copied'/, 'manual audit email fallbacks should be recognized');
assert.match(script, /auditEntryViews = uniqueCountAcross\(\['homepage_view', 'audit_landing_view'\]\)/, 'audit conversion denominator should include both entry pages without double-counting a session');
assert.match(script, /\['homepage_view', 'audit_landing_view', 'blog_index_view', 'blog_post_view'\]/, 'all entry and blog visits should be attributed to traffic sources');
assert.match(css, /collector-health\[data-state="connected"\]/, 'connected health state should be styled');
assert.match(css, /collector-health\[data-state="error"\]/, 'error health state should be styled');
assert.match(css, /live-refresh\[data-state="live"\]/, 'the live refresh state should be styled');

console.log('Metrics health diagnostics validated.');
