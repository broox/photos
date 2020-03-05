const pages = {
  HOME: 'home',
  ALBUM: 'album',
  SEARCH: 'search',
  TAG: 'tag',
};


const routes = [
  {
    path: '/',
    name: pages.HOME,
    components: { header: HeaderSearch, content: Gallery },
  },
  {
    path: '/search/:query',
    name: pages.SEARCH,
    components: { header: HeaderSearch, content: Gallery },
  },
  {
    path: '/tagged/:tag',
    name: pages.TAG,
    components: { header: HeaderTitle, content: Gallery },
  },
  {
    path: '/:album',
    name: pages.ALBUM,
    components: { header: HeaderTitle, content: Gallery },
  },
];

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    album: null,
    page: null,
    photos: [],
    query: null,
    tag: null,
    title: null,
  },
  mutations: {
    clearFilters(state) {
      state.album = null;
      state.query = null;
      state.tag = null;
    },
    pushPhotos(state, photos) {
      state.photos.push(...photos);
    },
    setAlbum(state, album) {
      state.album = album;
    },
    setPage(state, {title, page}) {
      state.title = title;
      state.page = page;
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
    pushPhotos({commit}, photos) {
      commit('pushPhotos', photos);
    },
    search({commit}, query) {
      commit('setQuery', query);
    },
    selectAlbum({commit}, album) {
      commit('setAlbum', album);
    },
    selectFeed({commit}) {
      commit('clearFilters');
    },
    selectPage({commit}, {title, page}) {
      commit('setPage', {title, page});
    },
    setPhotos({commit}, photos) {
      commit('setPhotos', photos);
    },
    selectTag({commit}, tag) {
      commit('setTag', tag);
    }
  },
});

const router = new VueRouter({
  mode: 'history',
  routes
});


const app = new Vue({
  router,
  // data: GlobalStore,
  store,
  methods: {
    go(title, route) {
      document.title = title;
      // this.page = route.name;
      // this.title = title;
      this.$store.dispatch('selectPage', {title, page: route.name});
      this.$router.push(route).catch(err => {});
    },
    search(query) {
      // this.query = query;
      this.$store.dispatch('search', query);
      this.go(query, {name: pages.SEARCH, params: {query: query}});
    },
    selectAlbum(album) {
      // this.album = album;
      this.$store.dispatch('selectAlbum', album);
      this.go(album.title, {name: pages.ALBUM, params: {album: album.slug}});
    },
    selectTag(tag) {
      // this.tag = tag;
      this.$store.dispatch('selectTag', tag);
      const title = `#${tag.name.replace(/\s/g, '')}`;
      this.go(title, {name: pages.TAG, params: {tag: tag.slug}});
    },
    showRecent() {
      // this.album = null;
      // this.query = null;
      // this.tag = null;
      this.$store.dispatch('selectFeed');
      this.go('Broox Photos', {name: pages.HOME});
    }
  }
}).$mount('#app');


const header = document.getElementById('pageHeader');
const sticky = header.offsetTop;
window.onscroll = () => {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
};
