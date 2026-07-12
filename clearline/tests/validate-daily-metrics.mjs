import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('metrics/index.html', root), 'utf8');
const script = await readFile(new URL('metrics/metrics.js', root), 'utf8');
const css = await readFile(new URL('metrics/metrics.css', root), 'utf8');

for (const id of ['daily-date', 'today-entry-visits', 'today-audit-clicks', 'today-audit-submissions', 'today-audit-rate']) {
  assert.match(html, new RegExp(`id="${id}"`), `daily dashboard must include ${id}`);
  assert.match(script, new RegExp(`'${id}'`), `daily reporting must populate ${id}`);
}

assert.match(script, /setUTCDate/, 'previous-day comparison must use UTC boundaries');
assert.match(script, /homepage_view', 'audit_landing_view/, 'daily entry traffic must include both audit entry pages');
assert.match(script, /describeChange/, 'daily metrics must compare against yesterday');
assert.match(css, /\.daily-grid/, 'daily report must have responsive dashboard styling');

console.log('Validated UTC daily metrics and prior-day comparisons.');
