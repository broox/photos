function serializeForPhotoSwipe(photo) {
  const thumbnail = isLargeViewport() ? photo.images.medium : photo.images.small;
  let src = photo.images.medium;
  if (photo.images.large) {
    src = photo.images.large;
  }

  const tags = photo.tags;
  let description = photo.description;
  if (tags) {
    description += '<br>';
    for (let i = 0; i < tags.length; i++) {
      description += ' <a href="/tagged/'+tags[i].slug+'">#'+tags[i].name.replace(/\s/g, '')+'</a>';
    }
  }

  return {
    id: photo.id,
    src: src,
    w: photo.width,
    h: photo.height,
    msrc: thumbnail,
    title: description,
    thumbnail: thumbnail
  }
  // todo: album, camera, tags, etc
}

const photosMixin = {
  data: {
    album: null,
    albums: [],
    cachedPhotos: [],
    cachedPhotoAmount: 0,
    fullSearch: false,   // whether we are performing a full search after a form submit
    limit: 40,           // page size
    loading: false,
    photos: [],
    offset: 0,           // paging
    pageText: null,      // for album descriptions
    photoRowHeight: 200,
    searchInput: null,   // what is typed into the input form
    searchTerm: null,    // the currently active search
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
    showRealtimeSearchResults() {
      return this.albums.length > 0 && !this.album && !this.tag;
    },
    photoCountDisplay() {
      const photoCount = this.totalPhotoCount;
      if (photoCount) {
        return photoCount.toLocaleString() + ' ' + pluralize(photoCount, 'photo');
      }
    }
  },
  methods: {
    addPhotosToGallery(photos) {
      const photoSwipePhotos = photos.map(serializeForPhotoSwipe)
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
    clearRealtimeSearchResults(event) {
      // event.preventDefault();
      // event.stopPropagation();
      this.albums = [];
    },
    clearSearch() {
      this.searchTerm = null;
    },
    clearSearchForm() {
      this.searchInput = null;
      this.clearRealtimeSearchResults();
      this.clearSearch();
      this.resetPage();
      return this.loadPhotos();
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

      if (this.searchTerm) {
        filters['search'] = this.searchTerm;
      }

      if (this.tag) {
        filters['tag'] = this.tag;
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

      return fetch('/api/v1/photos?' + buildQueryString(Object.assign(params,filters)))
        .then(response => {
          return response.json();
        })
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
          console.error('Error fetching photos');
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
    realtimeSearch(event) {

      if (this.lastSearchTerm == this.searchInput) {
        return;
      }

      if (this.searchInput.length > 2 && event.key !== 'Enter') {
        this.searchAlbums(this.searchInput);
        this.lastSearchTerm = this.searchInput;
      } else {
        this.clearRealtimeSearchResults();
        this.lastSearchTerm = null;
      }
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
    searchAlbums(term) {
      this.message = 'Loading...';
      this.loading = true;
      const params = {
        limit: 15,
        search: term
      };

      const lastSearch = term;
      return fetch('/api/v1/albums?' + buildQueryString(params))
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (this.fullSearch || lastSearch !== term) {
          return;
        }
        const albums = data.data;
        this.albums = albums;
        this.message = null;
        this.loading = false;
      })
      .catch(err => {
        this.message = 'Error loading albums';
        this.loading = false;
        console.error('Error fetching albums');
      });
    },
    searchPhotos() {
      this.clearRealtimeSearchResults();
      this.resetPage();
      this.searchTerm = this.searchInput;
      this.fullSearch = true;
      this.loadPhotos().then(() => {
        this.fullSearch = false;
      });
    },
    selectAlbum(album) {
      // keep this.albums set so that the search results are retained
      // when the user goes back
      this.album = album;
      this.title = album.title;
      this.clearSearch();
      this.resetPage();
      if (this.album.description) {
        this.pageText = this.album.description;
      }
      return this.loadPhotos();
    },
    selectTag(tag) {
      this.tag = tag;
      this.title = tag;
      this.clearSearch();
      this.resetPage();
      return this.loadPhotos();
    },
    setupSlideShow() {
      const thumbnails = document.querySelectorAll('.item');
      for (let i = thumbnails.length; i--;) {
        thumbnails[i].onclick = this.openSlideShow;
      }
    },
    syncSearchForm() {
      if (this.searchInput !== this.searchTerm) {
        this.searchInput = this.searchTerm;
      }
    },
    updateGalleryURL() {
      let url = window.location.origin;
      let title = 'Broox Photos';

      if (this.album) {
        url += '/'+this.album.slug;
        title = this.album.title;
      } else if (this.searchTerm) {
        const searchTerm = encodeURIComponent(this.searchTerm)
        url += '/search/'+searchTerm;
        title = searchTerm;
      } else if (this.tag) {
        url += '/tagged/'+this.tag;
        title = this.tag;
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