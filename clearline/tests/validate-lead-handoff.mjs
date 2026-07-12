import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const leadScripts = ['script.js', 'audit/audit.js', 'blog/article.js'];

for (const relativePath of leadScripts) {
  const source = await readFile(new URL(relativePath, root), 'utf8');
  assert.match(source, /const clearlineInbox = \['[^']+', '[^']+'\]\.join\('@'\);/, `${relativePath} must define the recipient inbox`);
  assert.match(source, /mailto:\$\{clearlineInbox\}\?subject=/, `${relativePath} must address prepared email to the recipient inbox`);
  assert.doesNotMatch(source, /mailto:\?subject=/, `${relativePath} must not create an email without a recipient`);
}

const thankYou = await readFile(new URL('thank-you/thank-you.js', root), 'utf8');
assert.match(thankYou, /emailLink\.href = intent === 'audit' \? '\.\.\/audit\/' : '\.\.\/#contact';/, 'thank-you fallback must return visitors to the correct form');

console.log(`Validated ${leadScripts.length} recipient-addressed lead handoffs and the thank-you fallback.`);
