(function () {
  'use strict';

  // Claims are verified for a specific offer window. Keeping the window beside
  // the count prevents last week's social proof from silently carrying into a
  // new weekly offer.
  const offer = Object.freeze({ total: 3, verifiedClaimed: 1, verifiedThrough: '2026-07-12' });
  const offerDeadlines = document.querySelectorAll('[data-offer-deadline]');
  const countdowns = document.querySelectorAll('[data-offer-countdown]');
  const dayNumbers = document.querySelectorAll('[data-offer-days-number]');
  const dayLabels = document.querySelectorAll('[data-offer-days-label]');
  const timers = document.querySelectorAll('[data-offer-timer]');
  const timerDays = document.querySelectorAll('[data-offer-timer-days]');
  const timerHours = document.querySelectorAll('[data-offer-timer-hours]');
  const timerMinutes = document.querySelectorAll('[data-offer-timer-minutes]');
  const claimedCounts = document.querySelectorAll('[data-offer-claimed-count]');
  const remainingCounts = document.querySelectorAll('[data-offer-remaining-count]');
  const requestCounts = document.querySelectorAll('[data-offer-request-count]');
  const progressLabels = document.querySelectorAll('[data-offer-progress-label]');
  const progressBars = document.querySelectorAll('[data-offer-progress]');

  if (!offerDeadlines.length && !countdowns.length && !dayNumbers.length) return;

  function renderCountdown(now = new Date()) {
    const deadline = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7;

    deadline.setDate(now.getDate() + daysUntilSunday);
    deadline.setHours(23, 59, 59, 999);

    const deadlineKey = [
      deadline.getFullYear(),
      String(deadline.getMonth() + 1).padStart(2, '0'),
      String(deadline.getDate()).padStart(2, '0')
    ].join('-');
    const claimed = deadlineKey === offer.verifiedThrough ? offer.verifiedClaimed : 0;
    const remaining = Math.max(offer.total - claimed, 0);

    claimedCounts.forEach((element) => {
      element.textContent = `${claimed} of ${offer.total} claimed`;
    });
    remainingCounts.forEach((element) => {
      element.textContent = `${remaining === 1 ? 'One' : remaining} founder-template spot${remaining === 1 ? '' : 's'} remain for qualifying audit requests`;
    });
    requestCounts.forEach((element) => {
      element.textContent = claimed
        ? `${claimed} founder${claimed === 1 ? ' has' : 's have'} already requested an audit.`
        : 'Be the first founder to request an audit this week.';
    });
    progressLabels.forEach((element) => {
      element.setAttribute('aria-label', `${claimed} of ${offer.total} founder template spots claimed this week`);
    });
    progressBars.forEach((element) => {
      element.setAttribute('aria-valuemax', offer.total);
      element.setAttribute('aria-valuenow', claimed);
      const fill = element.querySelector('span');
      if (fill) fill.style.width = `${Math.min((claimed / offer.total) * 100, 100)}%`;
    });

    const formattedDeadline = new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric'
    }).format(deadline);

    offerDeadlines.forEach((element) => {
      element.textContent = formattedDeadline;
      element.setAttribute('datetime', deadlineKey);
    });

    const countdownText = daysUntilSunday === 0
      ? 'Offer ends today'
      : `${daysUntilSunday} day${daysUntilSunday === 1 ? '' : 's'} left`;

    const remainingMilliseconds = Math.max(deadline.getTime() - now.getTime(), 0);
    const totalMinutes = Math.floor(remainingMilliseconds / (60 * 1000));
    const exactDays = Math.floor(totalMinutes / (24 * 60));
    const exactHours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const exactMinutes = totalMinutes % 60;

    timerDays.forEach((element) => { element.textContent = String(exactDays).padStart(2, '0'); });
    timerHours.forEach((element) => { element.textContent = String(exactHours).padStart(2, '0'); });
    timerMinutes.forEach((element) => { element.textContent = String(exactMinutes).padStart(2, '0'); });
    timers.forEach((element) => {
      element.setAttribute('aria-label', `Offer ends in ${exactDays} days, ${exactHours} hours, and ${exactMinutes} minutes`);
    });

    countdowns.forEach((element) => { element.textContent = countdownText; });
    dayNumbers.forEach((element) => { element.textContent = daysUntilSunday; });
    dayLabels.forEach((element) => {
      element.textContent = daysUntilSunday === 0 ? 'ends today' : `day${daysUntilSunday === 1 ? '' : 's'} left`;
    });
  }

  renderCountdown();

  // Keep the day count correct if a prospect leaves the page open overnight.
  window.setInterval(renderCountdown, 60 * 1000);
}());
