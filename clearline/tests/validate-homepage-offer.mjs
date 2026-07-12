import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const script = await readFile(new URL('script.js', root), 'utf8');
const offerScript = await readFile(new URL('offer.js', root), 'utf8');

assert.match(
  homepage,
  /<a class="availability-badge" href="#contact" data-audit data-placement="availability_badge">/,
  'the limited-availability badge must open the homepage audit form and identify its analytics placement'
);
assert.match(
  homepage,
  /Limited offer: founder template for the first 3 qualifying requests by <time data-offer-deadline>Sunday<\/time>/,
  'the badge must state the qualified offer and expose its concrete deadline'
);
assert.match(
  homepage,
  /if you’re among the first three/,
  'the homepage must qualify who receives the limited bonus'
);
assert.match(
  homepage,
  /class="offer-alert" aria-label="Limited founder template offer"/,
  'the homepage must give the limited offer a prominent, accessible announcement bar'
);
assert.match(
  homepage,
  /data-audit data-placement="offer_alert"/,
  'the announcement bar must open the audit flow with distinct attribution'
);
assert.match(homepage, /1 of 3 claimed/, 'the announcement must use the verified request count');
assert.match(homepage, /Two founder-template spots remain/, 'the announcement must state the truthful remaining availability');
assert.match(homepage, /This week’s offer <span data-offer-banner-deadline>ends Sunday<\/span>/, 'the announcement must lead with an explicit weekly deadline');
assert.match(offerScript, /ends in \$\{daysUntilSunday\} day/, 'the announcement must show the exact number of days remaining');
assert.match(offerScript, /bannerDeadlines\.forEach/, 'the announcement deadline must update with the weekly countdown');
assert.match(homepage, /class="offer-timer" role="timer"[^>]*data-offer-timer/, 'the hero must show an accessible live offer timer');
assert.match(homepage, /data-offer-timer-days>[—<]/, 'the timer must expose a days value');
assert.match(homepage, /data-offer-timer-hours>[—<]/, 'the timer must expose an hours value');
assert.match(homepage, /data-offer-timer-minutes>[—<]/, 'the timer must expose a minutes value');
assert.doesNotMatch(homepage, /only 1 (?:founder-template )?(?:bonus|spot) left/i, 'the homepage must not claim unsupported scarcity');
assert.match(
  script,
  /placement: link\.dataset\.placement \|\| 'audit_section'/,
  'audit CTAs must report their placement to analytics'
);

console.log('Validated the linked, attributed, and qualified homepage availability offer.');
