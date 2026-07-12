import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const analytics = await readFile(new URL('analytics.js', root), 'utf8');
const metrics = await readFile(new URL('metrics/metrics.js', root), 'utf8');
const html = await readFile(new URL('metrics/index.html', root), 'utf8');

assert.match(analytics, /sessionStorage\.getItem\(sessionKey\)/, 'tracker must reuse a tab-session identifier');
assert.match(analytics, /sessionStorage\.setItem\(sessionKey, created\)/, 'tracker must persist the identifier for the tab session');
assert.match(analytics, /const attributionKey = 'clearline_analytics_attribution_v1'/, 'tracker must persist first-touch attribution within the session');
assert.match(analytics, /track\(`\$\{pageType\}_view`, getAttribution\(\)\)/, 'internal page views must inherit campaign attribution');
assert.match(analytics, /sessionId: getSessionId\(\)/, 'each event must include its anonymous session identifier');
assert.match(metrics, /new Set\(matching\.map/, 'headline visit totals must deduplicate sessions');
assert.match(metrics, /uniqueCountAcross\(\['homepage_view', 'audit_landing_view'\]\)/, 'combined audit traffic must not double-count a session that visits both entry pages');
assert.match(metrics, /dailyUniqueCount/, 'daily entry totals must deduplicate sessions');
assert.match(metrics, /legacy:/, 'events emitted before session tracking must remain reportable');
assert.match(metrics, /attributedSessions\.has\(session\)/, 'traffic sources must count each session only once');
assert.match(html, /deduplicated per browser tab session/, 'dashboard must explain how visit totals are counted');

console.log('Validated anonymous session tracking and unique-visit reporting.');
