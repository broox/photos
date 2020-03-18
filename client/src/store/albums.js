import { serializeAlbum } from "@/utils.js";
import Album from "@/models/album.js";

// TODO: parent/sub albums

export default {
    state: {
      albums: [],
      cache: {},
      count: 0
    },
    mutations: {
      cacheAlbums(state, key) {
        state.cache[key] = {
          albums: state.albums,
          count: state.count
        };
      },
      pushAlbums(state, { albums, count }) {
        state.albums.push(...albums);
        state.count = count;
      },
      replaceAlbums(state, { albums, count }) {
        state.albums = albums;
        state.count = count;
      },
      reset(state) {
        state.albums = [];
        state.count = 0;
      }
    },
    actions: {
      fetchAlbums({commit, state, rootState}) {
        const lastAlbumQuery = rootState.query; // FIXME
        const params = {
          limit: 40,
          search: rootState.query
        };

        const cacheKey = JSON.stringify(rootState.query);
        if (state.cache[cacheKey]) {
          const cachedAlbums = state.cache[cacheKey];
          commit('replaceAlbums', {
            count: cachedAlbums.count,
            albums: cachedAlbums.albums
          });
          return; // FIXME: this is not a promise...
        }

        return Album.fetchIndex(params)
          .then(data => {
            if (lastAlbumQuery !== rootState.query) {
              // Hack to drop stale requests on the floor
              return;
            }
            commit('pushAlbums', {
              albums: data.data.map(serializeAlbum),
              count: data.meta.count
            });
            commit('cacheAlbums', cacheKey);
          })
          .catch(err => {
            console.error("Error fetching albums", err);
          });
      },
    }
  };