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

document.querySelectorAll('[data-plan]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.querySelector('[name="service"]');
    const plan = link.dataset.plan;
    select.value = plan === 'Partner' ? 'Ongoing content partner' : 'Something else';
    if (plan !== 'Partner') document.querySelector('[name="message"]').value = `I'm interested in the ${plan} package. `;
  });
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const subject = encodeURIComponent(`Project inquiry: ${data.get('service')}`);
  const body = encodeURIComponent(`Hi Clearline,\n\nI'm ${data.get('firstName')} (${data.get('email')}).\n\nI'm interested in: ${data.get('service')}\n\n${data.get('message')}`);
  document.querySelector('.form-status').textContent = 'Opening your email app to send the details…';
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
