import { serializeAlbum } from "@/utils.js";
import Album from "@/models/album.js";

// TODO: parent/sub albums

export default {
    state: {
      count: 0,
      albums: []
    },
    mutations: {
      pushAlbums(state, { albums, count }) {
        state.albums.push(...albums);
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
        return Album.fetchIndex(params)
          .then(data => {
            if (lastAlbumQuery !== rootState.query) {
              return;
            }
            commit('pushAlbums', {
              albums: data.data.map(serializeAlbum),
              count: data.meta.count
            });
          })
          .catch(err => {
            console.error("Error fetching albums", err);
          });
      },
    }
  };