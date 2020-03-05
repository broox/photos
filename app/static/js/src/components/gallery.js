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
