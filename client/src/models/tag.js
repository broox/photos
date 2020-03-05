import { buildQueryString } from "../utils.js";

const baseURI = "/api/v1/tags";

export default {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);
    return fetch(`${baseURI}?${buildQueryString(params)}`).then(response => {
      return response.json();
    });
  },
  get(id) {
    return fetch(`${baseURI}/${id}`).then(response => {
      return response.json();
    });
  }

};
