import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');

assert.match(homepage, /id="early-signal"/, 'the homepage must include the early social-proof section');
assert.match(homepage, /One audit requested/, 'the section must state the verified request count accessibly');
assert.match(homepage, /first founder request/, 'the section must describe the verified early demand');
assert.match(homepage, /unless they explicitly approve a public testimonial/, 'the section must protect the requester until permission is recorded');
assert.match(homepage, /data-placement="early_signal"/, 'the social-proof CTA must identify its analytics placement');
assert.doesNotMatch(homepage, /class="stars"|aria-label="5 stars"/, 'the homepage must not display an unverified star rating');
assert.doesNotMatch(homepage, /Client story coming soon/, 'the homepage must not pair invented quotes with placeholder identities');

console.log('Validated the honest, privacy-safe homepage social proof and attributed CTA.');
