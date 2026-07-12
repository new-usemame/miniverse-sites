const newsletterForm = document.querySelector('#newsletter-form');

newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = new FormData(newsletterForm).get('email').trim();
  const subject = encodeURIComponent('Subscribe me to The Clear Note');
  const body = encodeURIComponent(`Please add ${email} to The Clear Note newsletter.\n\nI understand I can unsubscribe at any time.`);
  const status = newsletterForm.querySelector('.newsletter-status');
  window.clearlineAnalytics?.track('newsletter_signup', { placement: 'blog_sidebar' });

  status.textContent = 'Opening your email app to confirm…';
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
