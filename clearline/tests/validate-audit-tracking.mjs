import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const auditPage = await readFile(new URL('audit/index.html', root), 'utf8');
const analytics = await readFile(new URL('analytics.js', root), 'utf8');
const metrics = await readFile(new URL('metrics/metrics.js', root), 'utf8');

assert.match(
  auditPage,
  /<body data-analytics-page="audit_landing">/,
  'the dedicated audit page must emit an audit_landing_view event'
);
assert.match(
  analytics,
  /track\(`\$\{pageType\}_view`,/,
  'the shared analytics client must derive page-view events from data-analytics-page'
);
assert.match(
  metrics,
  /const auditLandingViews = uniqueCount\('audit_landing_view'\);/,
  'the dashboard must count the event emitted by the dedicated audit page'
);

console.log('Validated the dedicated audit page event from markup through dashboard reporting.');
