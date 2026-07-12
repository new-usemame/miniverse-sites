import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const auditPage = await readFile(new URL('audit/index.html', root), 'utf8');
const auditStyles = await readFile(new URL('audit/audit.css', root), 'utf8');

assert.match(auditPage, /One of three founder template spots claimed this week/, 'the audit page must describe verified progress accessibly');
assert.match(auditPage, /aria-valuemax="3" aria-valuenow="1"/, 'the audit progress bar must expose its current value');
assert.match(auditPage, /data-offer-countdown/, 'the audit page must show the shared live countdown');
assert.match(auditPage, /class="offer-timer audit-offer-timer" role="timer"[^>]*data-offer-timer/, 'the audit page must preserve the exact live timer after click-through');
assert.match(auditPage, /data-offer-timer-days>[—<]/, 'the audit timer must expose a days value');
assert.match(auditPage, /data-offer-timer-hours>[—<]/, 'the audit timer must expose an hours value');
assert.match(auditPage, /data-offer-timer-minutes>[—<]/, 'the audit timer must expose a minutes value');
assert.match(auditPage, /1 founder has already requested an audit/, 'the form must repeat only the verified request count');
assert.match(auditPage, /data-offer-request-count/, 'the form demand signal must reset with the weekly offer');
assert.match(auditPage, /<time data-offer-deadline>Sunday<\/time>/, 'the form availability note must use the truthful shared deadline');
assert.match(auditStyles, /\.audit-offer-track span\{[^}]*width:33\.333%/, 'the visible progress must agree with one of three claimed');
assert.doesNotMatch(auditPage, /only 2 left|2 (?:spots|bonuses) (?:left|remain)/i, 'the page must not turn claimed progress into unverified remaining inventory');

console.log('Validated the truthful, accessible audit-page offer progress and countdown.');
