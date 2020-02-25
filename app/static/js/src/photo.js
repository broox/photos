const Photo = {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);
    return fetch('/api/v1/photos?' + buildQueryString(params))
      .then(response => {
        return response.json();
      })
  }
};
