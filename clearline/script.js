const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');

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
  const body = encodeURIComponent(`Hi Clearline,\n\nI'm ${data.get('firstName')} (${data.get('email')}).\n\nI'm interested in: ${data.get('service')}${website}\n\n${data.get('message')}`);
  document.querySelector('.form-status').textContent = 'Opening your email app to send the details…';
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
