import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('audit/index.html', root), 'utf8');
const script = await readFile(new URL('audit/audit.js', root), 'utf8');

const requiredFields = [...page.matchAll(/<(?:input|textarea)\b[^>]*\brequired\b[^>]*>/g)];
assert.equal(requiredFields.length, 2, 'audit form should require only email and homepage URL');
assert.match(requiredFields[0][0], /name="email"/, 'email must remain required');
assert.match(requiredFields[1][0], /name="website"/, 'homepage URL must remain required');
assert.match(page, /First name <span class="optional">Optional<\/span>/, 'first name must be visibly optional');
assert.match(page, /What do you most want to improve\? <span class="optional">Optional<\/span>/, 'improvement context must be visibly optional');
assert.match(script, /firstName \? `I'm \$\{firstName\}/, 'email handoff must support an optional first name');
assert.match(script, /improvement \? `\\n\\nWhat I want to improve:/, 'email handoff must omit empty improvement context');

console.log('Validated the two-field audit request and optional-context email handoff.');
