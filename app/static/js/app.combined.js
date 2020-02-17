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
    msrc: photo.images.medium,
    title: photo.description,
    thumbnail: thumbnail
  }
  // todo: album, camera, tags, etc
}

const photosMixin = {
  data: {
    photos: [],
    offset: 0,
    limit: 20,
    photoRowHeight: 200
  },
  created() {
    if (isLargeViewport()) {
      this.limit = 40;
      this.photoRowHeight = 300;
    }
  },
  methods: {
    getRecentPhotos(offset, limit) {
      this.message = 'Loading...';
      limit = limit || this.limit

      return fetch('/api/v1/photos?limit='+limit+'&offset='+offset)
        .then(response => {
          return response.json();
        })
        .then(data => {
          const photos = data.data;
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
      this.getRecentPhotos(this.offset, this.limit).then(() => {
        this.renderGallery();
        this.setupSlideShow();
      });
    },
    renderGallery() {
      new flexImages({ selector: '.flex-images', rowHeight: this.photoRowHeight });
      window.addEventListener('scroll', this.infiniteScroll);
    },
    addPhotosToGallery(photos) {
      // Gallery
      // this.photos.push(...photos);
      // Slideshow
      var photoSwipePhotos = photos.map(serializeForPhotoSwipe)
      this.photos.push(...photoSwipePhotos);
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
        }
      };

      if( isNaN(options.index) ) {
        return;
      }

      console.log('open photo ' + options.index + ' of ' + this.photos.length);

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
const app = new Vue({
  el: '#app',
  data: {
    message: null
  },
  mixins: [photosMixin],
  beforeMount() {
    this.getRecentPhotos().then(() => {
      this.renderGallery();
      this.setupSlideShow();
    });
  }
})

// Mobile
// - load smaller thumbnail images