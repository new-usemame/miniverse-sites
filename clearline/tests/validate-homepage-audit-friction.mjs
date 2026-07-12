import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const script = await readFile(new URL('script.js', root), 'utf8');

assert.match(homepage, /data-first-name-optional hidden/, 'first name must expose its optional audit-mode label');
assert.match(homepage, /data-message-optional hidden/, 'context must expose its optional audit-mode label');
assert.match(script, /firstName\.required = !isAudit/, 'first name must become optional for audit requests');
assert.match(script, /message\.required = !isAudit/, 'improvement context must become optional for audit requests');
assert.match(script, /website\.required = isAudit/, 'homepage URL must be required for audit requests');
assert.match(script, /setInquiryMode\('audit'\)/, 'every homepage audit CTA must activate the short audit form');
assert.match(script, /Request my free audit/, 'the submit action must match the selected audit flow');
assert.match(script, /Free homepage audit request/, 'the prepared email must identify an audit request clearly');
assert.match(script, /My email is \$\{data\.get\('email'\)\}/, 'the prepared email must remain natural without a first name');
assert.match(script, /data\.get\('message'\) \?/, 'the prepared email must omit empty optional context');

console.log('Validated the two-required-field homepage audit flow and clean email fallback.');
