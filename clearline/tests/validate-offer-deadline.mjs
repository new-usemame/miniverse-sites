import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'audit/index.html', 'thank-you/index.html'];
const offerScript = fs.readFileSync(new URL('offer.js', root), 'utf8');

for (const page of pages) {
  const html = fs.readFileSync(new URL(page, root), 'utf8');
  assert.match(html, /<time data-offer-deadline>Sunday<\/time>/, `${page} needs the dated offer`);
  assert.doesNotMatch(html, /bonuses available this week/i, `${page} must not claim unverified inventory`);
  assert.match(html, /(?:\.\.\/)?offer\.js/, `${page} needs the shared deadline script`);
}

const targets = Array.from({ length: 3 }, () => ({
  textContent: '',
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; }
}));
const countdown = { textContent: '' };
const dayNumber = { textContent: '' };
const dayLabel = { textContent: '' };
let intervalCallback;

class FixedDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : ['2026-07-12T12:00:00Z']));
  }
}

vm.runInNewContext(offerScript, {
  Date: FixedDate,
  Intl,
  window: {
    setInterval(callback, delay) {
      intervalCallback = callback;
      assert.equal(delay, 60 * 1000);
    }
  },
  document: { querySelectorAll: (selector) => ({
    '[data-offer-deadline]': targets,
    '[data-offer-countdown]': [countdown],
    '[data-offer-days-number]': [dayNumber],
    '[data-offer-days-label]': [dayLabel]
  }[selector] || []) }
});

for (const target of targets) {
  assert.equal(target.textContent, 'Jul 12');
  assert.equal(target.attributes.datetime, '2026-07-12');
}
assert.equal(countdown.textContent, 'Offer ends today');
assert.equal(dayNumber.textContent, 0);
assert.equal(dayLabel.textContent, 'ends today');
assert.equal(typeof intervalCallback, 'function', 'offer countdown must keep refreshing on long-lived pages');

intervalCallback(new Date('2026-07-13T12:00:00Z'));
assert.equal(countdown.textContent, '6 days left', 'offer countdown must update after the local day changes');
assert.equal(dayNumber.textContent, 6);
assert.equal(dayLabel.textContent, 'days left');

console.log('Validated the truthful, automatically dated founder-template offer.');
