<template>
  <div>
    <div class="pageText" v-show="pageText" v-html="pageText"></div>
    <p class="photoCount" v-show="totalPhotoCount">{{ photoCountDisplay }}</p>
    <div class="flex-images">
      <div
        v-for="(photo, index) in photos"
        v-bind:key="index"
        class="item"
        :id="photo.id"
        :data-w="photo.w"
        :data-h="photo.h"
        :data-index="index"
      >
        <img :src="photo.thumbnail" :alt="photo.title" />
      </div>
    </div>
    <div class="loading" v-show="loading">
      <i class="fa fa-spin fa-spinner"></i>
    </div>

    <!-- photoswipe -->
    <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
            <button class="pswp__button pswp__button--share" title="Share"></button>
            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
            <button title="Album" class="pswp__button pswp__button--album"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
    
          <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div class="pswp__share-tooltip"></div>
          </div>
    
          <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
    
          <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
    
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { isLargeViewport, pluralize } from "@/utils.js";
import flexImages from "@/lib/flex-images.min.js";
import { mapState } from "vuex";
import PhotoSwipe from "@/lib/photoswipe.min.js";
import PhotoSwipeUI_Default from "@/lib/photoswipe-ui.js";  // Not including the minified version because i have made UI changes

export default {
  name: "Gallery",
  data: () => {
    return {
      photoRowHeight: 200
    };
  },
  created() {
    if (isLargeViewport()) {
      this.photoRowHeight = 300;
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.infiniteScroll);
  },
  mounted() {
    if (this.photos.length) {
      // This is hit when photos are set from a cache
      this.renderGallery();
      this.setupSlideShow();
    }
  },
  updated() {
    if (this.photos.length) {
      this.renderGallery();
      this.setupSlideShow();
    }
  },
  computed: {
    pageText() {
      return this.album ? this.album.description : null;
    },
    photoCountDisplay() {
      const photoCount = this.totalPhotoCount;
      if (photoCount) {
        return pluralize(photoCount, "photo");
      }
      return null;
    },
    ...mapState({
      album: state => state.album,
      loading: state => state.loading,
      offset: state => state.photos.offset,
      photos: state => state.photos.photos,
      query: state => state.query,
      tag: state => state.tag,
      totalPhotoCount: state => state.photos.totalPhotoCount
    })
  },
  methods: {
    loadMorePhotos() {
      this.$store.dispatch("fetchMorePhotos");
    },
    renderGallery() {
      new flexImages({ selector: ".flex-images", rowHeight: this.photoRowHeight });
      if (this.offset < this.totalPhotoCount) {
        window.addEventListener("scroll", this.infiniteScroll);
      }
    },
    setupSlideShow() {
      const thumbnails = document.querySelectorAll(".item");
      for (let i = thumbnails.length; i--; ) {
        thumbnails[i].onclick = this.openSlideShow;
      }
    },
    openSlideShow(event) {
      // event = event || window.event;
      event.preventDefault();
      const pswpElement = document.querySelectorAll(".pswp")[0];
      const options = {
        index: parseInt(event.currentTarget.dataset.index, 10),
        getThumbBoundsFn: function(index) {
          var thumbnail = document.querySelectorAll(".item img")[index],
              pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect(); 

          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        },
        fullscreenEl: false,
        shareEl: false,
        shareButtons: [
          { id:"download", label:"Download image", url:"{{raw_image_url}}", download:true }
        ]
      };

      if (isNaN(options.index)) {
        return;
      }

      const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, this.photos, options);
      gallery.init();
    },
    infiniteScroll() {
      const documentHeight = document.documentElement.offsetHeight;
      const offset = document.documentElement.scrollTop + window.innerHeight + this.photoRowHeight * 10;
      if (offset >= documentHeight) {
        window.removeEventListener("scroll", this.infiniteScroll);
        this.loadMorePhotos();
      }
    }
  }
};
</script>

<style lang="scss">
  @import "~@/assets/styles/flex-images.css";
  @import "~@/assets/styles/photoswipe.css";
  @import "~@/assets/styles/photoswipe-skin.css";

  .pageText {
    padding: 5px;
  }

  .photoCount {
    color: $secondaryTextColor;
    margin: 5px;
    text-align: left;
  }

  .loading {
    color: $secondaryTextColor;
    margin: 20px;
    text-align: center;
  }
</style>
