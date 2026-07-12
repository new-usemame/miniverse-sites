const emailLink = document.querySelector('#send-email');
const pendingEmail = sessionStorage.getItem('clearline_pending_email');
const intent = new URLSearchParams(window.location.search).get('type');

if (pendingEmail?.startsWith('mailto:')) {
  const emailFallback = document.querySelector('#email-fallback');
  const copyRequest = document.querySelector('#copy-request');
  const fallbackStatus = document.querySelector('#fallback-status');
  const [addressPart, query = ''] = pendingEmail.slice('mailto:'.length).split('?');
  const emailParams = new URLSearchParams(query);
  const recipient = decodeURIComponent(addressPart);
  const subject = emailParams.get('subject') || '';
  const body = emailParams.get('body') || '';
  const preparedRequest = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;

  emailLink.href = pendingEmail;
  emailFallback.hidden = false;
  document.querySelector('#fallback-recipient').textContent = recipient;

  copyRequest.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(preparedRequest);
      fallbackStatus.textContent = 'Prepared request copied. Paste it into a new email and press send.';
    } catch {
      window.prompt('Copy this prepared request:', preparedRequest);
      fallbackStatus.textContent = 'Copy the request above, then paste it into a new email.';
    }
    window.clearlineAnalytics?.track(intent === 'audit' ? 'audit_email_copied' : 'contact_email_copied');
  });

  emailLink.addEventListener('click', () => {
    window.clearlineAnalytics?.track(intent === 'audit' ? 'audit_email_opened' : 'contact_email_opened');
    sessionStorage.removeItem('clearline_pending_email');
    sessionStorage.removeItem('clearline_inquiry_intent');
  }, { once: true });
} else {
  emailLink.textContent = 'Return to the inquiry form';
  emailLink.href = intent === 'audit' ? '../audit/' : '../#contact';
}

if (intent === 'audit') {
  document.querySelector('#thanks-copy').textContent = 'Open the prepared email below and press send. Once it arrives, we’ll review your homepage and reply within three business days.';
  const referralCard = document.querySelector('#referral-card');
  const shareButton = document.querySelector('#share-offer');
  const copyButton = document.querySelector('#copy-offer');
  const shareStatus = document.querySelector('#share-status');
  const shareUrl = new URL('../?utm_source=referral&utm_medium=share&utm_campaign=founder_template#audit', window.location.href).href;
  const shareData = {
    title: 'Free homepage copy audit from Clearline',
    text: 'Clearline is offering a free, human-reviewed homepage copy audit, plus a founder messaging template for the first three qualifying startups this week.',
    url: shareUrl
  };

  referralCard.hidden = false;

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareStatus.textContent = 'Referral link copied.';
      window.clearlineAnalytics?.track('audit_referral_copied');
    } catch {
      window.prompt('Copy this referral link:', shareUrl);
    }
  }

  shareButton.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shareStatus.textContent = 'Thanks for sharing Clearline.';
        window.clearlineAnalytics?.track('audit_referral_shared');
      } catch (error) {
        if (error.name !== 'AbortError') await copyShareLink();
      }
    } else {
      await copyShareLink();
    }
  });

  copyButton.addEventListener('click', copyShareLink);
}
