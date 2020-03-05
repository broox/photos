function buildQueryString(params) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}


function getBrowserWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}


function getBrowserHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}


function isLargeViewport() {
  return getBrowserWidth() > 500;
}


function pluralize(number, word) {
  if (number !== 1){
    word = word+'s';
  }
  return number.toLocaleString() + ' ' + word;
};


function relativeTime(datetime) {
  const now = new Date();
  const elapsed = now - datetime;
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  if (elapsed < msPerMinute) {
    const seconds = Math.round(elapsed / 1000);
    return pluralize(seconds, 'second') + ' ago';
  }

  if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute);
    return pluralize(minutes, 'minute') + ' ago';
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return pluralize(hours, 'hour') + ' ago';
  }

  if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay);
    return pluralize(days, 'day') + ' ago';
  }

  if (elapsed < msPerYear) {
    const months = Math.round(elapsed/msPerMonth);
    return pluralize(months, 'month') + ' ago';
  }

  const years = Math.round(elapsed / msPerYear);
  return pluralize(years, 'year') + ' ago';
}

const Album = {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);
    return fetch('/api/v1/albums?' + buildQueryString(params))
      .then(response => {
        return response.json();
      });
  }
};

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

const Tag = {
  fetchIndex(options) {
    const defaults = {
      limit: 40,
      offset: 0
    };
    const params = Object.assign(defaults, options);
    return fetch('/api/v1/tags?' + buildQueryString(params))
      .then(response => {
        return response.json();
      });
  }
};

const GlobalStore = {
  album: null,
  page: null,
  query: null,
  tag: null,
  title: null,
};

function serializeAlbum(album) {
    album.url = `/${album.slug}`;
    album.thumbnail = `https://derek.broox.com/square/${album.slug}/${album.thumbnail_id}/${album.slug}.jpg`;
    album.time = album.created_at ? relativeTime(Date.parse(album.created_at)) : null;
  
    return album;
  }
  
  // TODO: fix search results clearing when exiting out of an album
  //       - use vue router?
  //       infinite scroll to the right
  Vue.component('AlbumList', {
    props: [
      'search'
    ],
    data: () => {
      return {
        albumCount: 0,
        albums: [],
      }
    },
    computed: {
      albumCountDisplay() {
        const albumCount = this.albumCount;
        if (albumCount) {
          return pluralize(albumCount, 'album');
        }
      }
    },
    watch: {
      search(query) {
        this.$refs.albums.scrollLeft = 0;
  
        if (!query) {
          this.albumCount = 0;
          this.albums = [];
        }
  
        const lastAlbumQuery = query;
        const params = {
          limit: 40,
          search: query
        };
        return Album.fetchIndex(params)
          .then(data => {
            if (lastAlbumQuery !== query) {
              return;
            }
            this.albumCount = data.meta.count;
            this.albums = data.data.map(serializeAlbum);
            console.log(this.albumCount);
            console.log(this.albums);
          })
          .catch(err => {
            console.error('Error fetching albums', err);
          });
      }
    },
    methods: {
      selectAlbum(album) {
        this.$emit('album', album);
      }
    }
  });
function serializeForPhotoSwipe(photo) {
  const thumbnail = isLargeViewport() ? photo.images.medium : photo.images.small;
  let src = photo.images.medium;
  if (photo.images.large) {
    src = photo.images.large;
  }

  const tags = photo.tags;
  let tagString = '';
  if (tags) {
    for (let i = 0; i < tags.length; i++) {
      tagString += ' <a href="/tagged/'+tags[i].slug+'">#'+tags[i].name.replace(/\s/g, '')+'</a>';
    }
  }

  const photoDate = photo.taken_at || photo.created_at;
  let time = null;
  if (photoDate) {
    time = relativeTime(Date.parse(photoDate));
  }

  return {
    id: photo.id,
    src: src,
    w: photo.width,
    h: photo.height,
    date: time,
    msrc: thumbnail,
    title: photo.description,
    tags: tagString,
    thumbnail: thumbnail,
  }
  // todo: album, camera, tags, etc
}

const Gallery = Vue.component('Gallery', {
//const Gallery = {
  template: `
    <div>
      <div class="pageText" v-show="pageText" v-html="pageText"></div>
      <p class="photoCount" v-show="totalPhotoCount">{{photoCountDisplay}}</p>
      <div class="flex-images">
        <div v-for="(photo, index) in photos" class="item" :id="photo.id" :data-w="photo.w" :data-h="photo.h" :data-index="index">
          <img :src="photo.thumbnail" :alt="photo.title"/>
        </div>
      </div>
      <div class="loading" v-show="loading"><i class="fa fa-spin fa-spinner"></i></div>
    </div>
  `,
  data: () => {
    return {
      // global: GlobalStore,
      cachedPhotos: [],
      cachedPhotoAmount: 0,
      limit: 40,           // page size
      loading: false,
      // photos: [],
      offset: 0,           // paging
      pageText: null,      // for album descriptions
      photoRowHeight: 200,
      showModal: false,
      totalPhotoCount: 0,

      // album: null,
      // query: null,
      // tag: null,
    }
  },
  created() {
    if (isLargeViewport()) {
      this.photoRowHeight = 300;
    }
  },
  computed: {
    photoCountDisplay() {
      const photoCount = this.totalPhotoCount;
      if (photoCount) {
        return pluralize(photoCount, 'photo');
      }
    },
    album() {
      return this.$store.state.album;
    },
    page() {
      return this.$store.state.page;
    },
    photos() {
      return this.$store.state.photos;
    },
    query() {
      return this.$store.state.query;
    },
    tag() {
      return this.$store.state.tag;
    },
  },
  watch: {
    'album': function(album) {
      if (album != null) {
        this.resetPage();
        // this.album = album;
        if (album.description) {
          this.pageText = album.description;
        }
        this.loadPhotos();
      }
    },
    'page': function(page) {
      if (page == pages.HOME) {
        this.resetPage();
        this.loadPhotos();
      }
    },
    'tag': function(tag) {
      if (tag != null) {
        this.resetPage();
        // this.tag = tag;
        this.loadPhotos();
      }
    },
    'query': function(query) {
      if (query != null) {
        this.resetPage();
        // this.query = query;
        this.loadPhotos();
      }
    },
  },
  methods: {
    addPhotosToGallery(photos) {
      const photoSwipePhotos = photos.map(serializeForPhotoSwipe);
      this.$store.dispatch('pushPhotos', photoSwipePhotos);
      // this.photos.push(...photoSwipePhotos);
    },
    // clearGallery() {
    //   console.log('clear gallery');
    //   this.$root.showRecent();
    // },
    fetchPhotos() {
      this.loading = true;
      const params = {
        limit: this.limit,
        offset: this.offset
      };
      const filters = {};

      if (this.album) {
        filters['album_id'] = this.album.id;
      }

      if (this.query) {
        filters['search'] = this.query;
      }

      if (this.tag) {
        filters['tag'] = this.tag.slug;
      }

      // let cacheHomePage = false;
      // // cache unfiltered photo results
      // if (!Object.keys(filters).length && this.offset == 0) {
      //   if (this.cachedPhotos.length) {
      //     this.loading = false;
      //     // this.photos = this.cachedPhotos;
      //     this.$store.dispatch('setPhotos', this.cachedPhotos);
      //     this.totalPhotoCount = this.cachedPhotoAmount;
      //     return new Promise((resolve, reject) => { resolve(); });
      //   }
      //   cacheHomePage = true;
      // }

      return Photo.fetchIndex(Object.assign(params,filters))
        .then(data => {
          const photos = data.data;
          this.totalPhotoCount = data.meta.count;
          this.addPhotosToGallery(photos);
          this.loading = false;

          // if (cacheHomePage) {
          //   this.cachedPhotoAmount = this.totalPhotoCount;
          //   this.cachedPhotos = this.photos.slice(0, 40);
          // }
        })
        .catch(err => {
          this.loading = false;
          console.error('Error fetching photos.', err);
        });
    },
    loadPhotos() {
      return this.fetchPhotos().then(() => {
        this.renderGallery();
        this.setupSlideShow();
      });
    },
    loadMorePhotos() {
      this.offset = this.offset + this.limit;
      if (this.offset >= this.totalPhotoCount)
        return;
      return this.loadPhotos();
    },
    renderGallery() {
      new flexImages({ selector: '.flex-images', rowHeight: this.photoRowHeight });
      if (this.offset < this.totalPhotoCount) {
        window.addEventListener('scroll', this.infiniteScroll);
      }
    },
    resetPage() {
      // this.album = null;
      // this.query = null;
      // this.tag = null;

      this.pageText = null;
      //this.photos = [];
      this.$store.dispatch('setPhotos', []);
      this.offset = 0;
      this.totalPhotoCount = 0;
      window.scrollTo(0, 0);
    },
    setupSlideShow() {
      const thumbnails = document.querySelectorAll('.item');
      for (let i = thumbnails.length; i--;) {
        thumbnails[i].onclick = this.openSlideShow;
      }
    },
    toggleModal(visible) {
      this.showModal = visible;
    },
    openSlideShow(event) {
      // event = event || window.event;
      event.preventDefault();
      const pswpElement = document.querySelectorAll('.pswp')[0];
      const options = {
        index: parseInt(event.currentTarget.dataset.index, 10),
        getThumbBoundsFn: function(index) {
          var thumbnail = document.querySelectorAll('.item img')[index],
              pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect(); 

          return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        },
        fullscreenEl: false,
        shareEl: false,
        shareButtons: [
          { id:'download', label:'Download image', url:'{{raw_image_url}}', download:true }
        ],
      };

      if( isNaN(options.index) ) {
        return;
      }

      const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, this.photos, options);
      gallery.init();
    },
    infiniteScroll() {
      const documentHeight = document.documentElement.offsetHeight;
      const offset = document.documentElement.scrollTop + window.innerHeight + this.photoRowHeight * 10;
      if (offset >= documentHeight) {
        this.loadMorePhotos();
        window.removeEventListener('scroll', this.infiniteScroll);
      }
    }
  }
})

const ALBUM = 'album';
const TAG = 'tag';

const HeaderSearch = Vue.component('HeaderSearch', {
  template: `
    <form class="wrap" v-on:submit.prevent="searchPhotos">
      <div class="search">
        <input type="text" class="searchInput" placeholder="Search Broox Photos" autocorrect="off" autocapitalize="off" v-model="input" v-on:input="realtimeSearch" v-on:paste="realtimeSearch" v-on:blur="syncSearchForm">
        <button type="submit" class="searchButton" v-show="!query">
          <i class="fas fa-search"></i>
        </button>
        <button type="button" class="clearSearch" v-show="query" v-on:click="clearSearchForm">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="realtimeSearchResults" v-show="showRealtimeSearchResults" v-cloak>
        <ul>
          <li v-for="result in realtimeResults" v-on:click="selectRealtimeSearch(result)" :class="result.type">
            <i class="fas fa-tag" v-if="result.type == 'tag'"></i>
            <i class="fas fa-images"v-if="result.type == 'album'"></i>
            {{ result.display }}
          </li>
        </ul>
      </div>
    </form>
  `,
  props: [
    'modal'
  ],
  data: () => {
    return {
      // global: GlobalStore,
      albums: [],
      dropRealtimeResults: false, // prevent race conditions on full page / photo searches
      input: null,                // value displayed in the input form
      lastQuery: null,
      query: null,                // the currently active search
      tags: [],
    }
  },
  computed: {
    globalQuery() {
      return this.$store.state.query;
    },
    showRealtimeSearchResults() {
      const visible = this.albums.length > 0;
      return visible;
    },
    realtimeResults() {
      const displayLimit = 10;
      const albums = this.albums.map((album) => { return { type: ALBUM, display: album.title, album: album } });
      let tags = this.tags.map((tag) => { return { type: TAG, display: tag.name, tag: tag } });

      const totalItems = this.albumCount + this.tagCount;
      const halfLimit = 5;
      if (totalItems > displayLimit && this.tagCount > halfLimit) {
        let tagLimit;
        if (this.tagCount > halfLimit && this.albumCount > halfLimit) {
          tagLimit = halfLimit;
        } else {
          tagLimit = displayLimit - this.albumCount
        }
        tags = tags.slice(0, tagLimit);
      }

      const results = tags.concat(albums).slice(0, displayLimit);
      const displayedAlbums = results.filter(result => result.type === ALBUM);
      const displayedTags = results.filter(result => result.type === TAG);
      const remainingResults = [];

      if (this.tagCount > displayedTags.length) {
        const remainingTags = this.tagCount - displayedTags.length;
        remainingResults.push(pluralize(remainingTags, 'more tag'));
      }

      if (this.albumCount > displayedAlbums.length) {
        const remainingAlbums = this.albumCount - displayedAlbums.length;
        remainingResults.push(pluralize(remainingAlbums, 'more album'));
      }

      if (remainingResults) {
        results.push({
          type: 'summary',
          display: remainingResults.join(' and ')
        });
      }
      return results;
    }
  },
  created() {
    document.onkeydown = (event) => {
      if (event.key === 'Escape') {
          this.clearRealtimeSearchResults();
      }
    }    
  },
  watch: {
    'globalQuery': function(query) {
      // FIXME: bug here...
      if (query !== this.query) {
        this.query = query;
        this.syncSearchForm();
      }
    },
    modal(visible) {
      if (!visible) {
        this.clearRealtimeSearchResults();
      }
    },
    input(value) {
      // Enable realtime search when input value changes
      this.dropRealtimeResults = false;
    }
  },
  methods: {
    clearRealtimeSearchResults(event) {
      this.albums = [];
      this.tags = [];
    },
    clearSearch() {
      this.query = null; // should this.query be using this.global.query instead?
      // this.global.query = null;
    },
    clearSearchForm() {
      this.input = null;
      this.clearRealtimeSearchResults();
      this.clearSearch();
      this.$root.showRecent();
    },
    realtimeSearch(event) {
      if (this.lastQuery == this.input) {
        return;
      }

      if (this.input.length > 2 && event.key !== 'Enter') {
        this.searchTags(this.input);
        this.searchAlbums(this.input);
        this.lastQuery = this.input;
      } else {
        this.clearRealtimeSearchResults();
        this.lastQuery = null;
      }
    },
    searchAlbums(query) {
      const params = {
        limit: 10,
        search: query
      };

      const lastAlbumQuery = query;
      return Album.fetchIndex(params)
        .then(data => {
          if (this.dropRealtimeResults || lastAlbumQuery !== query) {
            return;
          }
          this.albums = data.data;
          this.albumCount = data.meta.count;
          // TODO: emit albums?
        })
        .catch(err => {
          console.error('Error fetching albums', err);
        });
    },
    searchPhotos() {
      this.clearRealtimeSearchResults();
      this.query = this.input;
      this.dropRealtimeResults = true;
      this.$root.search(this.query);
    },
    searchTags(query) {
      const params = {
        limit: 10,
        search: query
      };

      const lastTagQuery = query;  // TODO: move to lastRealtimeQuery?
      return Tag.fetchIndex(params)
        .then(data => {
          if (this.dropRealtimeResults || lastTagQuery !== query) {
            return;
          }
          this.tags = data.data;
          this.tagCount = data.meta.count;
        })
        .catch(err => {
          console.error('Error fetching tags', err);
        });
    },
    selectRealtimeSearch(result) {
      if (result.type === ALBUM) {
        this.$root.selectAlbum(result.album);
      } else if (result.type === TAG) {
        this.$root.selectTag(result.tag);
      }
    },
    syncSearchForm() {
      if (this.query && this.input !== this.query) {
        this.input = this.query;
      }
    },
  }
});

const HeaderTitle = Vue.component('HeaderTitle', {
  template: `
    <div class="galleryTitle">
      <i class="fas fa-chevron-left back" v-on:click="goBack"></i>
      <h1>{{ title }}</h1>
    </div>
  `,
  // data: () => {
  //   return {
  //     global: GlobalStore,
  //   }
  // },
  computed: {
    title() {
      return this.$store.state.title;
    }
  },
  methods: {
    goBack() {
      // TODO: check if there is history for this website in the router.
      // if so, use that, else go to showRecent()
      this.$root.showRecent();
    }
  }
});

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
