function serializeForPhotoSwipe(photo) {
  const thumbnail = isLargeViewport() ? photo.images.medium : photo.images.small;
  let src = photo.images.medium;
  if (photo.images.large) {
    src = photo.images.large;
  }

  return {
    id: photo.id,
    src: src,
    w: photo.width,
    h: photo.height,
    msrc: thumbnail,
    title: photo.description,
    thumbnail: thumbnail
  }
  // todo: album, camera, tags, etc
}

const photosMixin = {
  data: {
    album: null,
    albums: [],
    fullSearch: false,   // whether we are performing a full search after a form submit
    limit: 40,           // page size
    photos: [],
    offset: 0,           // paging
    pageText: null,      // for album descriptions
    photoRowHeight: 200,
    searchInput: null,   // what is typed into the input form
    searchTerm: null,    // the currently active search
    totalPhotoCount: 0
  },
  created() {
    if (isLargeViewport()) {
      this.photoRowHeight = 300;
    }
  },
  computed: {
    showRealtimeSearchResults() {
      return this.albums.length > 0;
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
    clearRealtimeSearchResults() {
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
    fetchPhotos() {
      this.message = 'Loading...';
      const params = {
        limit: this.limit,
        offset: this.offset
      };

      if (this.album) {
        params['album_id'] = this.album.id;
      }

      if (this.searchTerm) {
        params['search'] = this.searchTerm;
      }

      return fetch('/api/v1/photos?' + buildQueryString(params))
        .then(response => {
          return response.json();
        })
        .then(data => {
          const photos = data.data;
          this.totalPhotoCount = data.meta.count;
          this.addPhotosToGallery(photos);
          this.message = null;
        })
        .catch(err => {
          this.message = 'Error loading photos';
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
      })
      .catch(err => {
        this.message = 'Error loading albums';
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
      this.clearSearch();
      this.resetPage();
      if (this.album.description) {
        this.pageText = this.album.description;
      }
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
      }

      if (this.searchTerm) {
        const searchTerm = encodeURIComponent(this.searchTerm)
        url += '/search/'+searchTerm;
        title = searchTerm;
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