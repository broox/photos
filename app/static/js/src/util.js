function buildQueryString(params) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}


function getBrowserWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}


function getBrowserHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}


function isLargeViewport() {
  return getBrowserWidth() > 500;
}


function pluralize(number, word) {
  if (number !== 1){
    word = word+'s';
  }
  return number.toLocaleString() + ' ' + word;
};


function relativeTime(datetime) {
  const now = new Date();
  const elapsed = now - datetime;
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  if (elapsed < msPerMinute) {
    const seconds = Math.round(elapsed / 1000);
    return pluralize(seconds, 'second') + ' ago';
  }

  if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute);
    return pluralize(minutes, 'minute') + ' ago';
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return pluralize(hours, 'hour') + ' ago';
  }

  if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay);
    return pluralize(days, 'day') + ' ago';
  }

  if (elapsed < msPerYear) {
    const months = Math.round(elapsed/msPerMonth);
    return pluralize(months, 'month') + ' ago';
  }

  const years = Math.round(elapsed / msPerYear);
  return pluralize(years, 'year') + ' ago';
}
