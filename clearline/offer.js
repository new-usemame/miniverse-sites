(function () {
  'use strict';

  const offerDeadlines = document.querySelectorAll('[data-offer-deadline]');
  if (!offerDeadlines.length) return;

  const now = new Date();
  const deadline = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7;

  deadline.setDate(now.getDate() + daysUntilSunday);
  deadline.setHours(23, 59, 59, 999);

  const formattedDeadline = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric'
  }).format(deadline);

  offerDeadlines.forEach((element) => {
    element.textContent = formattedDeadline;
    element.setAttribute('datetime', [
      deadline.getFullYear(),
      String(deadline.getMonth() + 1).padStart(2, '0'),
      String(deadline.getDate()).padStart(2, '0')
    ].join('-'));
  });
}());
