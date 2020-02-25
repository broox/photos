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
  if (number == 1){
    return word;
  } else {
    return word+'s';
  }
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
    return seconds + pluralize(seconds, ' second') + ' ago';
  }

  if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute),
          text = pluralize(minutes, 'minute');
    return `${minutes} ${text} ago`;
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour),
          text = pluralize(hours, 'hour');
    return `${hours} ${text} ago`;
  }

  if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay),
          text = pluralize(days, 'day');
    return `${days} ${text} ago`;
  }

  if (elapsed < msPerYear) {
    const months = Math.round(elapsed/msPerMonth),
          text = pluralize(months, 'month');
    return `${months} ${text} ago`;
  }

  const years = Math.round(elapsed / msPerYear),
        text = pluralize(years, 'year');

  return `${years} ${text} ago`;
}