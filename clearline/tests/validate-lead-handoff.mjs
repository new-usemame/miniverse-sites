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
assert.match(thankYou, /navigator\.clipboard\.writeText\(preparedRequest\)/, 'thank-you page must offer a copy fallback when no email app opens');
assert.match(thankYou, /audit_email_copied/, 'audit copy fallbacks must be visible in analytics');

const thankYouPage = await readFile(new URL('thank-you/index.html', root), 'utf8');
assert.match(thankYouPage, /id="copy-request"/, 'thank-you page must render the manual email fallback control');

console.log(`Validated ${leadScripts.length} recipient-addressed lead handoffs and the thank-you fallback.`);
