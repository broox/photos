const Album = {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);
    return fetch('/api/v1/albums?' + buildQueryString(params))
      .then(response => {
        return response.json();
      });
  }
};
