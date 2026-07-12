const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign'];

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const stored = {};

  campaignKeys.forEach((key) => {
    const value = params.get(key);
    if (value) sessionStorage.setItem(`clearline_${key}`, value.slice(0, 100));
    stored[key] = sessionStorage.getItem(`clearline_${key}`) || '';
  });

  const referrer = document.referrer && !document.referrer.startsWith(window.location.origin)
    ? document.referrer.slice(0, 250)
    : sessionStorage.getItem('clearline_referrer') || '';
  if (referrer) sessionStorage.setItem('clearline_referrer', referrer);

  document.querySelector('[name="source"]').value = stored.utm_source;
  document.querySelector('[name="medium"]').value = stored.utm_medium;
  document.querySelector('[name="campaign"]').value = stored.utm_campaign;
  document.querySelector('[name="referrer"]').value = referrer;
}

captureAttribution();

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    menuButton.focus();
  }
});

document.querySelectorAll('[data-plan]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.querySelector('[name="service"]');
    const plan = link.dataset.plan;
    select.value = `${plan} package`;
    document.querySelector('[name="message"]').value = `I'm interested in the ${plan} package. `;
  });
});

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const service = link.dataset.service;
    document.querySelector('[name="service"]').value = service;
    document.querySelector('[name="message"]').value = `I'm interested in ${service.toLowerCase()}. `;
  });
});

document.querySelectorAll('[data-audit]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.querySelector('[name="service"]');
    const message = document.querySelector('[name="message"]');
    const websiteField = document.querySelector('.website-field');
    select.value = 'Website copy';
    websiteField.hidden = false;
    websiteField.querySelector('input').required = true;
    message.value = "I'd like a free homepage copy audit. The main thing I want my homepage to help me improve is: ";
  });
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const subject = encodeURIComponent(`Project inquiry: ${data.get('service')}`);
  const website = data.get('website') ? `\nHomepage: ${data.get('website')}` : '';
  const attribution = [
    data.get('source') && `Source: ${data.get('source')}`,
    data.get('medium') && `Medium: ${data.get('medium')}`,
    data.get('campaign') && `Campaign: ${data.get('campaign')}`,
    data.get('referrer') && `Referrer: ${data.get('referrer')}`
  ].filter(Boolean);
  const attributionBlock = attribution.length ? `\n\nHow I found Clearline:\n${attribution.join('\n')}` : '';
  const body = encodeURIComponent(`Hi Clearline,\n\nI'm ${data.get('firstName')} (${data.get('email')}).\n\nI'm interested in: ${data.get('service')}${website}\n\n${data.get('message')}${attributionBlock}`);
  document.querySelector('.form-status').textContent = 'Opening your email app to send the details…';
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
