import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, script, css] = await Promise.all([
  readFile(new URL('../metrics/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../metrics/metrics.js', import.meta.url), 'utf8'),
  readFile(new URL('../metrics/metrics.css', import.meta.url), 'utf8')
]);

for (const id of ['collector-health', 'health-title', 'health-detail']) {
  assert.match(html, new RegExp(`id="${id}"`), `metrics page should include #${id}`);
}

assert.match(script, /setCollectorHealth\(\s*'connected'/, 'successful feed requests should show a connected state');
assert.match(script, /setCollectorHealth\('error'/, 'failed feed requests should show an error state');
assert.match(script, /ignoredRecords = readableRecords - events\.length/, 'unknown and diagnostic records should be reported');
assert.match(css, /collector-health\[data-state="connected"\]/, 'connected health state should be styled');
assert.match(css, /collector-health\[data-state="error"\]/, 'error health state should be styled');

console.log('Metrics health diagnostics validated.');
