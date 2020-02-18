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
    limit: 20,
    photoRowHeight: 200,
    searchTerm: null
  },
  created() {
    if (isLargeViewport()) {
      this.limit = 40;
      this.photoRowHeight = 300;
    }
  },
  methods: {
    loadPhotos() {
      this.getRecentPhotos().then(() => {
        this.renderGallery();
        this.setupSlideShow();
      });
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
    searchPhotos() {
      this.photos = [];
      this.offset = 0;
      this.totalPhotoCount = 0;
      this.loadPhotos();
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
const app = new Vue({
  el: '#app',
  data: {
    message: null
  },
  mixins: [photosMixin],
  beforeMount() {
    this.loadPhotos();
  }
})

const header = document.getElementById('pageHeader');
const sticky = header.offsetTop;
window.onscroll = () => {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}
