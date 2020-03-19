// FIXME: going `back` to search results doesn't retain the tags
import Tag from "@/models/tag.js";
import { serializeTag } from "@/utils.js";

export default {
  state: {
    tags: [],
    cache: {},
    count: 0
  },
  mutations: {
    cacheTags(state, key) {
      state.cache[key] = {
        tags: state.tags,
        count: state.count
      };
    },
    pushTags(state, { tags, count }) {
      state.tags.push(...tags);
      state.count = count;
    },
    replaceTags(state, { tags, count }) {
      state.tags = tags;
      state.count = count;
    },
    reset(state) {
      state.tags = [];
      state.count = 0;
    }
  },
  actions: {
    fetchTags({commit, state, rootState}) {
      console.log('fetchTags');
      const lastTagQuery = rootState.query; // FIXME
      const params = {
        limit: 40,
        search: rootState.query
      };

      const cacheKey = JSON.stringify(rootState.query);
      if (state.cache[cacheKey]) {
        console.log('Tag cache hit!');
        const cachedTags = state.cache[cacheKey];
        console.log(cachedTags);
        commit('replaceTags', {
          count: cachedTags.count,
          tags: cachedTags.tags
        });
        return; // FIXME: this is not a promise...
      }

      return Tag.fetchIndex(params)
        .then(data => {
          if (lastTagQuery !== rootState.query) {
            // Hack to drop stale requests on the floor
            return;
          }
          commit('pushTags', {
            tags: data.data.map(serializeTag),
            count: data.meta.count
          });
          commit('cacheTags', cacheKey);
        })
        .catch(err => {
          console.error("Error fetching tags", err);
        });
    },
  }
};
