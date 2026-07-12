import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('index.html', root), 'utf8');
const styles = await readFile(new URL('styles.css', root), 'utf8');
const script = await readFile(new URL('script.js', root), 'utf8');

assert.match(page, /class="mobile-audit-cta"[^>]*data-mobile-audit-cta/, 'homepage must include the mobile audit action');
assert.match(page, /data-offer-claimed-count>1 of 3 claimed/, 'mobile action must use the shared verified claim count');
assert.match(page, /data-offer-countdown>Offer ends Sunday/, 'mobile action must use the live offer countdown');
assert.match(page, /data-audit data-placement="mobile_sticky"/, 'mobile action must use existing audit attribution');
assert.match(styles, /@media\(max-width:580px\)\{body\{padding-bottom:82px\}\.mobile-audit-cta\{position:fixed/, 'action must be fixed only at mobile widths with page clearance');
assert.match(styles, /\.mobile-audit-cta\.is-hidden\{pointer-events:none;opacity:0/, 'action must have a non-blocking hidden state');
assert.match(script, /new IntersectionObserver\(\(\[entry\]\) =>/, 'contact visibility must control the mobile action');
assert.match(script, /mobileAuditCta\.classList\.toggle\('is-hidden', entry\.isIntersecting\)/, 'action must disappear while the form is visible');

console.log('Validated the tracked, offer-aware mobile audit action and contact-form handoff.');
