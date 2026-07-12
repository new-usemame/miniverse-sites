import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [homepage, auditPage, offerScript] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('audit/index.html', root), 'utf8'),
  readFile(new URL('offer.js', root), 'utf8')
]);

assert.match(offerScript, /Object\.freeze\(\{ total: 3, verifiedClaimed: 1, verifiedThrough: '2026-07-12' \}\)/, 'offer inventory must be tied to its verified window');
assert.match(offerScript, /deadlineKey === offer\.verifiedThrough \? offer\.verifiedClaimed : 0/, 'stale claims must reset in a new offer week');
assert.match(offerScript, /data-offer-remaining-count/, 'shared offer code must render truthful remaining availability');
assert.match(offerScript, /data-offer-progress/, 'shared offer code must synchronize accessible progress bars');
assert.match(offerScript, /data-offer-request-count/, 'shared offer code must synchronize the audit-page demand signal');

for (const [name, page] of [['homepage', homepage], ['audit page', auditPage]]) {
  assert.match(page, /data-offer-claimed-count/, `${name} must source its claimed count from the shared offer state`);
  assert.match(page, /data-offer-progress/, `${name} must source its progress bar from the shared offer state`);
  assert.match(page, /data-offer-progress-label/, `${name} must update its accessible progress description`);
  assert.doesNotMatch(page, /only 1 (?:founder-template )?(?:bonus|spot) left/i, `${name} must not publish unsupported scarcity`);
}

assert.match(homepage, /data-offer-remaining-count/, 'homepage offer alert must source remaining availability from shared state');

console.log('Validated synchronized, truthful offer inventory across conversion pages.');
