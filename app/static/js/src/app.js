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
