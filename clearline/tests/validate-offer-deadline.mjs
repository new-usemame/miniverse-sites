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

class FixedDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : ['2026-07-12T12:00:00Z']));
  }
}

vm.runInNewContext(offerScript, {
  Date: FixedDate,
  Intl,
  document: { querySelectorAll: () => targets }
});

for (const target of targets) {
  assert.equal(target.textContent, 'Jul 12');
  assert.equal(target.attributes.datetime, '2026-07-12');
}

console.log('Validated the truthful, automatically dated founder-template offer.');
