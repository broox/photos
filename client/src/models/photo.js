import { buildQueryString } from "../utils.js";

export default {
  // async fetchIndex(options) {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);

    // const response = await fetch('/api/v1/photos?' + buildQueryString(params));
    // return response.json();

    return fetch('/api/v1/photos?' + buildQueryString(params))
      .then(response => {
        return response.json();
      })
  },
  fetchRandom() {
    return fetch('/api/v1/photos/random')
      .then(response => {
        return response.json();
      })
  }
};
