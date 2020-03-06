import Photo from "@/models/photo.js";
import router from "@/router";
import { serializeForPhotoSwipe } from "@/utils.js";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    album: null,
    coverContent: false,
    limit: 40,
    loading: false,
    offset: 0,
    photoFilters: null,
    photos: [],
    query: null,
    tag: null,
    title: null,
    totalPhotoCount: 0
  },
  mutations: {
    clearFilters(state) {
      state.album = null;
      state.query = null;
      state.tag = null;
    },
    coverContent(state, visible) {
      state.coverContent = visible;
    },
    incrementOffset(state) {
      state.offset += state.limit;
    },
    photoFilters(state, filters) {
      state.photoFilters = filters;
    },
    pushPhotos(state, { photos, count }) {
      state.photos.push(...photos);
      state.totalPhotoCount = count;
      state.loading = false;
    },
    resetPhotos(state) {
      // FIXME: combine clearFilters and resetPhotos?
      // when would i call one without the other?
      state.photos = [];
      state.offset = 0;
      state.totalPhotoCount = 0;
    },
    setAlbum(state, album) {
      state.album = album;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setPage(state, title) {
      state.title = title;
    },
    setPhotos(state, photos) {
      state.photos = photos;
    },
    setQuery(state, query) {
      state.query = query;
    },
    setTag(state, tag) {
      state.tag = tag;
    }
  },
  actions: {
    coverContent({commit}, visible) {
      commit('coverContent', visible);
    },
    fetchPhotos({commit, state}) {
      commit('setLoading', true);
      const params = {
        limit: state.limit,
        offset: state.offset
      };
      const filters = {};

      if (state.album) {
        filters["album_id"] = state.album.id;
      }

      if (state.query) {
        filters["search"] = state.query;
      }

      if (state.tag) {
        filters["tag"] = state.tag.slug;
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
        })
        .catch(err => {
          commit('setLoading', false);
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
    search({commit, dispatch}, query) {
      commit('resetPhotos'); // FIXME: maybe resetPhotos should be dispatched from Gallery.destroy?
      dispatch('selectPage', {
        title: query,
        path: { name: "Search", params: { query } } // FIXME: urlencode?
      });
      commit('setQuery', query);
      dispatch('fetchPhotos');
    },
    selectAlbum({commit, dispatch}, album) {
      commit('clearFilters');
      commit('resetPhotos'); 
      dispatch('selectPage', {
        title: album.title,
        path: { name: "Album", params: { album: album.slug } }
      });
      commit('setAlbum', album);
      dispatch('fetchPhotos');
    },
    selectFeed({commit, dispatch}) {
      commit('clearFilters');
      commit('resetPhotos'); 
      dispatch('selectPage', {
        title: 'Broox Photos',
        path: { name: "Home" }
      });
      dispatch('fetchPhotos');
    },
    selectPage({commit}, {title, path}) {
      commit('setPage', title);

      document.title = title;
      router.push(path).catch(() => {});
    },
    setPhotos({commit}, photos) {
      commit('setPhotos', photos);
    },
    selectTag({commit, dispatch}, tag) {
      commit('clearFilters');
      commit('resetPhotos'); 
      const title = `#${tag.name.replace(/\s/g, "")}`;
      dispatch('selectPage', {
        title,
        path: { name: "Tag", params: { tag: tag.slug } }
      });
      commit('setTag', tag);
      dispatch('fetchPhotos');
    }
  },
  modules: {}
});
