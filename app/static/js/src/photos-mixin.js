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
    photos: [],
    offset: 0,
    limit: 40,
    photoRowHeight: 200,
    searchTerm: null,
    searching: false
  },
  created() {
    if (isLargeViewport()) {
      this.photoRowHeight = 300;
    }
  },
  methods: {
    loadPhotos() {
      this.getRecentPhotos().then(() => {
        this.updateGalleryURL();
        this.renderGallery();
        this.setupSlideShow();
      });
    },
    updateGalleryURL() {
      let url = window.location.origin;
      let title = 'Page';
      if (this.searchTerm) {
        const searchTerm = encodeURIComponent(this.searchTerm)
        url += '/search/'+searchTerm;
        title = searchTerm;
      }
      window.history.pushState({ id: title }, title, url);
    },
    getRecentPhotos() {
      this.message = 'Loading...';
      const params = {
        limit: this.limit,
        offset: this.offset
      };

      if (this.searchTerm) {
        params['search'] = this.searchTerm;
      }

      const esc = encodeURIComponent;
      const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

      return fetch('/api/v1/photos?' + query)
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
    getMorePhotos() {
      this.offset = this.offset + this.limit;
      if (this.offset >= this.totalPhotoCount)
        return;
      this.loadPhotos();
    },
    renderGallery() {
      new flexImages({ selector: '.flex-images', rowHeight: this.photoRowHeight });
      //if (this.offset < this.totalPhotoCount) {
        window.addEventListener('scroll', this.infiniteScroll);
      //}
    },
    addPhotosToGallery(photos) {
      // Gallery
      // this.photos.push(...photos);
      // Slideshow
      var photoSwipePhotos = photos.map(serializeForPhotoSwipe)
      this.photos.push(...photoSwipePhotos);
    },
    resetPage() {
      this.photos = [];
      this.offset = 0;
      this.totalPhotoCount = 0;
      window.scrollTo(0, 0);
    },
    clearSearch() {
      this.searching = false;
      this.searchTerm = null;
      this.resetPage();
      this.loadPhotos();
    },
    searchPhotos() {
      this.resetPage();
      this.loadPhotos();
      this.searching = true;
    },
    setupSlideShow() {
      const thumbnails = document.querySelectorAll('.item');
      for (let i = thumbnails.length; i--;) {
        thumbnails[i].onclick = this.openSlideShow;
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
        this.getMorePhotos();
        window.removeEventListener('scroll', this.infiniteScroll);
      }
    }
  }
};