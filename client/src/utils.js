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
  if (album.cover_image) {
    album.thumbnail = album.cover_image.small;
  } else {
    console.log('no cover image returned. get it');
    // TODO: make an API request for the photo, the following is a hack that won't always work
    album.thumbnail = `https://derek.broox.com/square/${album.slug}/${album.cover_image_id}/${album.slug}.jpg`;
  }
  album.time = album.created_at ? relativeTime(Date.parse(album.created_at)) : null;
  return album;
}

export function serializeForPhotoSwipe(photo) {
  const thumbnail = isLargeViewport() ? photo.images.medium : photo.images.small;
  let src = photo.images.medium;
  if (photo.images.large) {
    src = photo.images.large;
  }

  const tagString = photo.tags.map(tag => {
    tag = serializeTag(tag);
    return `<a href="${tag.url}">${tag.hashtag}</a>`;
  }).join(" ");

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
  // todo: album, camera, etc
}

export function serializeTag(tag) {
  tag.hashtag = '#'+tag.name.replace(/['.\s]/g, '');
  tag.url = `/tagged/${tag.slug}`;
  return tag;
}
