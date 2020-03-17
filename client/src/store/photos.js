import Photo from "@/models/photo.js";
import { serializeForPhotoSwipe } from "@/utils.js";

export default {
    state: {
      limit: 40,
      offset: 0,
      photoFilters: null,
      photos: [],
      totalPhotoCount: 0
    },
    mutations: {
      incrementOffset(state) {
        state.offset += state.limit;
      },
      photoFilters(state, filters) {
        state.photoFilters = filters;
      },
      pushPhotos(state, { photos, count }) {
        state.photos.push(...photos);
        state.totalPhotoCount = count;
      },
      reset(state) {
        console.log('reset photos');
        state.photos = [];
        state.offset = 0;
        state.totalPhotoCount = 0;
      },
      setPhotos(state, photos) {
        state.photos = photos;
      },
    },
    actions: {
      fetchPhotos({commit, state, rootState}) {
        commit('setLoading', true, { root: true });
        const params = {
          limit: state.limit,
          offset: state.offset
        };
        const filters = {};
  
        console.log('fetch photos', rootState);

        if (rootState.album) {
          filters["album_id"] = rootState.album.id;
        }
  
        if (rootState.query) {
          filters["search"] = rootState.query;
        }
  
        if (rootState.tag) {
          filters["tag"] = rootState.tag.slug;
        }
  
        // Caching photoFilters is a hack to prevent a race condition
        commit('photoFilters', Object.assign({}, filters));
  
        return Photo.fetchIndex(Object.assign(params, filters))
          .then(data => {
            if (JSON.stringify(filters) !== JSON.stringify(state.photoFilters)) {
              // Hack to drop stale requests on the floor
              return;
            }
            const photos = data.data;
            const photoSwipePhotos = photos.map(serializeForPhotoSwipe);
            commit('pushPhotos', { photos: photoSwipePhotos, count: data.meta.count });
            commit('setLoading', false, { root: true });
          })
          .catch(err => {
            commit('setLoading', false, { root: true });
            console.error("Error fetching photos.", err);
          });
      },
      fetchMorePhotos({commit, dispatch, state}) {
        commit('incrementOffset');
        if (state.offset >= state.totalPhotoCount) return;
        dispatch('fetchPhotos');
      },
      pushPhotos({commit}, photos) {
        commit('pushPhotos', photos);
      },
      setPhotos({commit}, photos) {
        commit('setPhotos', photos);
      }
    }
  };