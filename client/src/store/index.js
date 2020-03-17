import Vue from "vue";
import Vuex from "vuex";

import albums from "@/store/albums";
import photos from "@/store/photos";
import router from "@/router";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    albums,
    photos
  },
  state: {
    album: null,
    coverContent: false,
    lastPage: null,
    loading: false,
    query: null,
    tag: null,
    title: null,
  },
  mutations: {
    coverContent(state, visible) {
      state.coverContent = visible;
    },
    reset(state) {
      console.log('reset main store');
      state.album = null;
      state.query = null;
      state.tag = null;
    },
    setAlbum(state, album) {
      state.album = album;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setLastPage(state, path) {
      state.lastPage = path;
    },
    setPage(state, title) {
      state.title = title;
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
    search({commit, dispatch}, query) {
      commit('reset'); // FIXME: maybe this should be dispatched from Gallery.destroy?
      dispatch('selectPage', {
        title: query,
        path: { name: "Search", params: { query } } // FIXME: urlencode?
      });
      commit('setQuery', query);
      dispatch('fetchAlbums');
      dispatch('fetchPhotos');
    },
    selectAlbum({commit, dispatch}, album) {
      commit('reset');
      dispatch('selectPage', {
        title: album.title,
        path: { name: "Album", params: { album: album.slug } }
      });
      commit('setAlbum', album);
      dispatch('fetchPhotos');
    },
    selectFeed({commit, dispatch}) {
      commit('reset');
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
    setLastPage({commit}, path) {
      // This is used to make the chevron on HeaderTitle smart
      commit('setLastPage', path);
    },
    selectTag({commit, dispatch}, tag) {
      commit('reset');
      const title = `#${tag.name.replace(/\s/g, "")}`;
      dispatch('selectPage', {
        title,
        path: { name: "Tag", params: { tag: tag.slug } }
      });
      commit('setTag', tag);
      dispatch('fetchPhotos');
    }
  }
});
