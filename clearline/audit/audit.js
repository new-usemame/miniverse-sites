const form = document.querySelector('#audit-form');
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
const params = new URLSearchParams(window.location.search);
const clearlineInbox = ['pj4wx2vj6n', 'privaterelay.appleid.com'].join('@');

campaignKeys.forEach((key) => {
  const value = params.get(key);
  if (value) sessionStorage.setItem(`clearline_${key}`, value.slice(0, 100));
  form.elements[key.replace('utm_', '')].value = sessionStorage.getItem(`clearline_${key}`) || '';
});

const externalReferrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer.slice(0, 250) : '';
form.elements.referrer.value = externalReferrer || sessionStorage.getItem('clearline_referrer') || '';
if (externalReferrer) sessionStorage.setItem('clearline_referrer', externalReferrer);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const attribution = [
    data.get('source') && `Source: ${data.get('source')}`,
    data.get('medium') && `Medium: ${data.get('medium')}`,
    data.get('campaign') && `Campaign: ${data.get('campaign')}`,
    data.get('referrer') && `Referrer: ${data.get('referrer')}`
  ].filter(Boolean);
  const subject = encodeURIComponent('Free homepage audit request');
  const body = encodeURIComponent(`Hi Clearline,\n\nI'm ${data.get('firstName')} (${data.get('email')}).\n\nHomepage: ${data.get('website')}\n\nWhat I want to improve: ${data.get('message')}${attribution.length ? `\n\nHow I found Clearline:\n${attribution.join('\n')}` : ''}`);
  const mailto = `mailto:${clearlineInbox}?subject=${subject}&body=${body}`;

  window.clearlineAnalytics?.track('audit_form_submission', { service: 'Website copy', landing: 'dedicated_audit' });
  await window.clearlineNotifications?.notify('audit_form_submission', { id: `audit:${Date.now()}` });
  sessionStorage.setItem('clearline_pending_email', mailto);
  sessionStorage.setItem('clearline_inquiry_intent', 'audit');
  form.querySelector('.form-status').textContent = 'Thanks—taking you to the final send step…';
  window.location.href = '../thank-you/?type=audit';
});
