export function buildQueryString(params) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + "=" + esc(params[k]))
    .join("&");
}

export function getBrowserWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

export function getBrowserHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

export function isLargeViewport() {
  return getBrowserWidth() >= 768;
}

export function pluralize(number, word) {
  if (number !== 1) {
    word = word + "s";
  }
  return number.toLocaleString() + " " + word;
}

export function relativeTime(datetime) {
  const now = new Date();
  const elapsed = now - datetime;
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  if (elapsed < msPerMinute) {
    const seconds = Math.round(elapsed / 1000);
    return pluralize(seconds, "second") + " ago";
  }

  if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute);
    return pluralize(minutes, "minute") + " ago";
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return pluralize(hours, "hour") + " ago";
  }

  if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay);
    return pluralize(days, "day") + " ago";
  }

  if (elapsed < msPerYear) {
    const months = Math.round(elapsed / msPerMonth);
    return pluralize(months, "month") + " ago";
  }

  const years = Math.round(elapsed / msPerYear);
  return pluralize(years, "year") + " ago";
}

export function serializeAlbum(album) {
  album.url = `/${album.slug}`;
  album.thumbnail = `https://derek.broox.com/square/${album.slug}/${album.thumbnail_id}/${album.slug}.jpg`;
  album.time = album.created_at ? relativeTime(Date.parse(album.created_at)) : null;
  return album;
}

export function serializeForPhotoSwipe(photo) {
  const thumbnail = isLargeViewport() ? photo.images.medium : photo.images.small;
  let src = photo.images.medium;
  if (photo.images.large) {
    src = photo.images.large;
  }

  const tags = photo.tags;
  let tagString = "";
  if (tags) {
    for (let i = 0; i < tags.length; i++) {
      tagString += ' <a href="/tagged/'+tags[i].slug+'">#'+tags[i].name.replace(/\s/g, '')+'</a>';
    }
  }

  const photoDate = photo.taken_at || photo.created_at;
  let time = null;
  if (photoDate) {
    time = relativeTime(Date.parse(photoDate));
  }

  return {
    id: photo.id,
    src: src,
    w: photo.width,
    h: photo.height,
    date: time,
    msrc: thumbnail,
    title: photo.description,
    tags: tagString,
    thumbnail: thumbnail
  };
  // todo: album, camera, tags, etc
}
