const emailLink = document.querySelector('#send-email');
const pendingEmail = sessionStorage.getItem('clearline_pending_email');
const intent = new URLSearchParams(window.location.search).get('type');

if (pendingEmail?.startsWith('mailto:')) {
  emailLink.href = pendingEmail;
  emailLink.addEventListener('click', () => {
    window.clearlineAnalytics?.track(intent === 'audit' ? 'audit_email_opened' : 'contact_email_opened');
    sessionStorage.removeItem('clearline_pending_email');
    sessionStorage.removeItem('clearline_inquiry_intent');
  }, { once: true });
} else {
  emailLink.textContent = 'Return to the inquiry form';
}

if (intent === 'audit') {
  document.querySelector('#thanks-copy').textContent = 'Open the prepared email below and press send. Once it arrives, we’ll review your homepage and reply within three business days.';
}
