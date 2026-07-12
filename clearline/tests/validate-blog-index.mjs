import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const hub = await readFile(new URL('blog/index.html', root), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
const metrics = await readFile(new URL('metrics/metrics.js', root), 'utf8');
const slugs = ['the-3-word-content-rule', 'founders-who-write-like-humans', 'why-most-startup-content-fails'];

assert.match(homepage, /href="blog\/">Blog<\/a>/, 'homepage navigation must link to the blog index');
assert.match(hub, /rel="canonical" href="https:\/\/new-usemame\.github\.io\/miniverse-sites\/clearline\/blog\/"/, 'blog index must have a canonical URL');
assert.match(hub, /data-analytics-page="blog_index"/, 'blog index must emit an analytics page view');
assert.match(metrics, /blog_index_view: 'Blog index viewed'/, 'dashboard must recognize blog index views');
assert.match(metrics, /uniqueCountAcross\(\['blog_index_view', 'blog_post_view'\]\)/, 'blog metric must deduplicate hub and article visits');
assert.match(hub, /utm_source=blog&amp;utm_medium=hub/, 'blog audit CTA must preserve campaign attribution');
assert.match(sitemap, /<loc>https:\/\/new-usemame\.github\.io\/miniverse-sites\/clearline\/blog\/<\/loc>/, 'sitemap must list the blog index');

for (const slug of slugs) {
  assert.match(hub, new RegExp(`href="${slug}/"`), `blog index must link to ${slug}`);
  const article = await readFile(new URL(`blog/${slug}/index.html`, root), 'utf8');
  assert.match(article, /href="\.\.\/">All articles<\/a>/, `${slug} must link back to the blog index`);
}

console.log('Validated the blog index, article discovery, attribution, and sitemap entry.');
