(function () {
  'use strict';

  const offer = Object.freeze({ total: 3, claimed: 1 });
  const offerDeadlines = document.querySelectorAll('[data-offer-deadline]');
  const countdowns = document.querySelectorAll('[data-offer-countdown]');
  const dayNumbers = document.querySelectorAll('[data-offer-days-number]');
  const dayLabels = document.querySelectorAll('[data-offer-days-label]');
  const claimedCounts = document.querySelectorAll('[data-offer-claimed-count]');
  const remainingCounts = document.querySelectorAll('[data-offer-remaining-count]');
  const progressBars = document.querySelectorAll('[data-offer-progress]');
  const remaining = Math.max(offer.total - offer.claimed, 0);

  claimedCounts.forEach((element) => {
    element.textContent = `${offer.claimed} of ${offer.total} claimed`;
  });
  remainingCounts.forEach((element) => {
    element.textContent = `${remaining === 1 ? 'One' : remaining} founder-template spot${remaining === 1 ? '' : 's'} remain for qualifying audit requests`;
  });
  progressBars.forEach((element) => {
    element.setAttribute('aria-valuemax', offer.total);
    element.setAttribute('aria-valuenow', offer.claimed);
    const fill = element.querySelector('span');
    if (fill) fill.style.width = `${Math.min((offer.claimed / offer.total) * 100, 100)}%`;
  });

  if (!offerDeadlines.length && !countdowns.length && !dayNumbers.length) return;

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

  const remainingDays = daysUntilSunday;
  const countdownText = remainingDays === 0
    ? 'Offer ends today'
    : `${remainingDays} day${remainingDays === 1 ? '' : 's'} left`;

  countdowns.forEach((element) => { element.textContent = countdownText; });
  dayNumbers.forEach((element) => { element.textContent = remainingDays; });
  dayLabels.forEach((element) => {
    element.textContent = remainingDays === 0 ? 'ends today' : `day${remainingDays === 1 ? '' : 's'} left`;
  });
}());
