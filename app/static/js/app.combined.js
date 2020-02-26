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
  if (number == 1){
    return word;
  } else {
    return word+'s';
  }
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
    return seconds + pluralize(seconds, ' second') + ' ago';
  }

  if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute),
          text = pluralize(minutes, 'minute');
    return `${minutes} ${text} ago`;
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour),
          text = pluralize(hours, 'hour');
    return `${hours} ${text} ago`;
  }

  if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay),
          text = pluralize(days, 'day');
    return `${days} ${text} ago`;
  }

  if (elapsed < msPerYear) {
    const months = Math.round(elapsed/msPerMonth),
          text = pluralize(months, 'month');
    return `${months} ${text} ago`;
  }

  const years = Math.round(elapsed / msPerYear),
        text = pluralize(years, 'year');

  return `${years} ${text} ago`;
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

const photosMixin = {
  data: {
    album: null,
    cachedPhotos: [],
    cachedPhotoAmount: 0,
    limit: 40,           // page size
    loading: false,
    photos: [],
    offset: 0,           // paging
    pageText: null,      // for album descriptions
    photoRowHeight: 200,
    search: null,        // the currently active search
    showModal: false,
    tag: null,
    title: null,
    totalPhotoCount: 0
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
        return photoCount.toLocaleString() + ' ' + pluralize(photoCount, 'photo');
      }
    }
  },
  methods: {
    addPhotosToGallery(photos) {
      const photoSwipePhotos = photos.map(serializeForPhotoSwipe);
      this.photos.push(...photoSwipePhotos);
    },
    clearAlbum() {
      this.album = null;
      this.resetPage();
      return this.loadPhotos();
    },
    clearGallery() {
      this.title = null;
      if (this.album) {
        this.clearAlbum();
      } else if (this.tag) {
        this.clearTag();
      }
    },
    clearTag() {
      this.tag = null;
      this.resetPage();
      return this.loadPhotos();
    },
    fetchPhotos() {
      this.message = 'Loading...';
      this.loading = true;
      const params = {
        limit: this.limit,
        offset: this.offset
      };
      const filters = {};

      if (this.album) {
        filters['album_id'] = this.album.id;
      }

      if (this.search) {
        filters['search'] = this.search;
      }

      if (this.tag) {
        filters['tag'] = this.tag.slug;
      }

      let cacheHomePage = false;
      // cache unfiltered photo results
      if (!Object.keys(filters).length && this.offset == 0) {
        if (this.cachedPhotos.length) {
          this.message = null;
          this.loading = false;
          this.photos = this.cachedPhotos;
          this.totalPhotoCount = this.cachedPhotoAmount;
          return new Promise((resolve, reject) => { resolve(); });
        }
        cacheHomePage = true;
      }

      return Photo.fetchIndex(Object.assign(params,filters))
        .then(data => {
          const photos = data.data;
          this.totalPhotoCount = data.meta.count;
          this.addPhotosToGallery(photos);
          this.message = null;
          this.loading = false;

          if (cacheHomePage) {
            this.cachedPhotoAmount = this.totalPhotoCount;
            this.cachedPhotos = this.photos.slice(0, 40);
          }
        })
        .catch(err => {
          this.message = 'Error loading photos';
          this.loading = false;
          console.error('Error fetching photos.', err);
        });
    },
    loadPhotos() {
      this.updateGalleryURL();
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
      this.pageText = null;
      this.photos = [];
      this.offset = 0;
      this.totalPhotoCount = 0;
      window.scrollTo(0, 0);
    },
    searchPhotos(query) {
      this.search = query;
      this.resetPage();
      this.loadPhotos();
    },
    selectAlbum(album) {
      this.album = album;
      this.search = null;
      this.title = album.title;
      this.resetPage();
      if (this.album.description) {
        this.pageText = this.album.description;
      }
      return this.loadPhotos();
    },
    selectTag(tag) {
      this.search = null;
      this.tag = tag;
      this.title = `#${tag.name.replace(/\s/g, '')}`;
      this.resetPage();
      return this.loadPhotos();
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
    updateGalleryURL() {
      let url = window.location.origin;
      let title = 'Broox Photos';

      if (this.album) {
        url += '/'+this.album.slug;
        title = this.album.title;
      } else if (this.search) {
        const search = encodeURIComponent(this.search)
        url += '/search/'+search;
        title = search;
      } else if (this.tag) {
        url += '/tagged/'+this.tag.slug;
        title = this.tag.name;
      }

      document.title = title;
      if (document.location !== url) {
        window.history.replaceState({ id: title }, title, url);
      }
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
};

const ALBUM = 'album';
const TAG = 'tag';

Vue.component('Search', {
  props: [
    'initQuery',
    'modal'
  ],
  data: () => {
    return {
      albums: [],
      dropRealtimeResults: false, // prevent race conditions on full page / photo searches
      input: null,                // value displayed in the input form
      lastQuery: null,
      query: null,                // the currently active search
      tags: [],
    }
  },
  computed: {
    showRealtimeSearchResults() {
      const visible = this.albums.length > 0;
      this.$emit('modal', visible);
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
        remainingResults.push(remainingTags + ' ' + pluralize(remainingTags, ('more tag')));
      }

      if (this.albumCount > displayedAlbums.length) {
        const remainingAlbums = this.albumCount - displayedAlbums.length;
        remainingResults.push(remainingAlbums + ' ' + pluralize(remainingAlbums, ('more album')));
      }

      console.log(remainingResults);
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
    initQuery(query) {
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
      this.query = null;
    },
    clearSearchForm() {
      this.input = null;
      this.clearRealtimeSearchResults();
      this.clearSearch();
      this.$emit('query', this.query);
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
      this.$emit('query', this.query);
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
          // TODO: emit tags?
        })
        .catch(err => {
          console.error('Error fetching tags', err);
        });
    },
    selectRealtimeSearch(result) {
      if (result.type === ALBUM) {
        return this.$emit(ALBUM, result.album);
      }

      if (result.type === TAG) {
        return this.$emit(TAG, result.tag);
      }
    },
    syncSearchForm() {
      if (this.query && this.input !== this.query) {
        this.input = this.query;
      }
    },
  }
});

const app = new Vue({
  el: '#app',
  data: {
    message: null
  },
  mixins: [photosMixin]
});

const header = document.getElementById('pageHeader');
const sticky = header.offsetTop;
window.onscroll = () => {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
};
