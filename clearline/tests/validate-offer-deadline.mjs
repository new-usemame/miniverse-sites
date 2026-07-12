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
const timer = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
const timerDay = { textContent: '' };
const timerHour = { textContent: '' };
const timerMinute = { textContent: '' };
const claimedCount = { textContent: '' };
const remainingCount = { textContent: '' };
const requestCount = { textContent: '' };
const progressLabel = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
const progressFill = { style: {} };
const progress = {
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  querySelector(selector) { return selector === 'span' ? progressFill : null; }
};
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
    '[data-offer-days-label]': [dayLabel],
    '[data-offer-timer]': [timer],
    '[data-offer-timer-days]': [timerDay],
    '[data-offer-timer-hours]': [timerHour],
    '[data-offer-timer-minutes]': [timerMinute],
    '[data-offer-claimed-count]': [claimedCount],
    '[data-offer-remaining-count]': [remainingCount],
    '[data-offer-request-count]': [requestCount],
    '[data-offer-progress-label]': [progressLabel],
    '[data-offer-progress]': [progress]
  }[selector] || []) }
});

for (const target of targets) {
  assert.equal(target.textContent, 'Jul 12');
  assert.equal(target.attributes.datetime, '2026-07-12');
}
assert.equal(countdown.textContent, 'Offer ends today');
assert.equal(dayNumber.textContent, 0);
assert.equal(dayLabel.textContent, 'ends today');
assert.equal(timerDay.textContent, '00');
assert.equal(timerHour.textContent, '11');
assert.equal(timerMinute.textContent, '59');
assert.equal(timer.attributes['aria-label'], 'Offer ends in 0 days, 11 hours, and 59 minutes');
assert.equal(claimedCount.textContent, '1 of 3 claimed');
assert.equal(remainingCount.textContent, '2 founder-template spots remain for qualifying audit requests');
assert.equal(requestCount.textContent, '1 founder has already requested an audit.');
assert.equal(progress.attributes['aria-valuenow'], 1);
assert.equal(progressFill.style.width, '33.33333333333333%');
assert.equal(typeof intervalCallback, 'function', 'offer countdown must keep refreshing on long-lived pages');

intervalCallback(new Date('2026-07-13T12:00:00Z'));
assert.equal(countdown.textContent, '6 days left', 'offer countdown must update after the local day changes');
assert.equal(dayNumber.textContent, 6);
assert.equal(dayLabel.textContent, 'days left');
assert.equal(timerDay.textContent, '06');
assert.equal(timerHour.textContent, '11');
assert.equal(timerMinute.textContent, '59');
assert.equal(claimedCount.textContent, '0 of 3 claimed', 'last week\'s claim must not carry into a new offer window');
assert.equal(remainingCount.textContent, '3 founder-template spots remain for qualifying audit requests');
assert.equal(requestCount.textContent, 'Be the first founder to request an audit this week.');
assert.equal(progressLabel.attributes['aria-label'], '0 of 3 founder template spots claimed this week');
assert.equal(progress.attributes['aria-valuenow'], 0);
assert.equal(progressFill.style.width, '0%');

console.log('Validated the truthful, automatically dated founder-template offer.');
