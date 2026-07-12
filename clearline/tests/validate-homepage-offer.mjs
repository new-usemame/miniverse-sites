import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const script = await readFile(new URL('script.js', root), 'utf8');

assert.match(
  homepage,
  /<a class="availability-badge" href="#contact" data-audit data-placement="availability_badge">/,
  'the limited-availability badge must open the homepage audit form and identify its analytics placement'
);
assert.match(
  homepage,
  /Limited availability: 3 founder template bonuses this week/,
  'the badge must state the concrete weekly offer'
);
assert.match(
  homepage,
  /if you’re among the first three/,
  'the homepage must qualify who receives the limited bonus'
);
assert.match(
  script,
  /placement: link\.dataset\.placement \|\| 'audit_section'/,
  'audit CTAs must report their placement to analytics'
);

console.log('Validated the linked, attributed, and qualified homepage availability offer.');
