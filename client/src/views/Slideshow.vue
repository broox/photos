<template>
  <div class="frame" v-if="image">
    <img :src="image">
    <div class="meta">
      <h1>{{photo.description}}</h1>
      <h2 v-if="relativeTime">{{ relativeTime }}</h2>
    </div>
  </div>
</template>

<script>
/* TODO:
 * - tags
 * - album name
 * - location
 * - go to previous photo
 * - fade to next photo
 * - don't display caption until image has loaded
 * /

import Photo from "@/models/photo.js";
import { relativeTime } from "@/utils.js";

export default {
  name: "Slideshow",
  data: () => {
    return {
      photo: null,
      sliding: null
    }
  },
  computed: {
    image() {
      if (!this.photo) return null;

      const images = this.photo.images;
      if (images.large) {
        return images.large;
      } else if (images.full) {
        return images.full;
      }

      return null;
    },
    relativeTime() {
      if (!this.photo) return null;

      const photoDate = this.photo.taken_at || this.photo.created_at;
      if (!photoDate) return null;
      
      return relativeTime(Date.parse(photoDate));
    }
  },
  methods: {
    loadRandomPhoto() {
      this.slidin = setInterval(() => {
        Photo.fetchRandom().then(data => {
          console.log(data);
          this.photo = data;
        })
      }, 10000);
    }
  },
  created() {
    this.loadRandomPhoto();
  },
  beforeDestroy() {
    clearInterval(this.slidin);
  }
}
</script>

<style lang="scss">
  .frame {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
  }

  img {
    object-fit: contain;
    // display: inline-flex;
    width: 100%;
    height: 100%;
  }

  .meta {
    background: rgba(0,0,0,0.2);
    color: #fff;
    position: absolute;
    bottom: 0;
    right: 0;

    font-size: 18px;
    padding: 1em;
  }

  h1 {
    font-size: 1em;
    margin: 0 0 .25em;
  }

  h2 {
    color: #ddd;
    font-size: .75em;
    margin: 0;
  }
</style>