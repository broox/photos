<template>
  <div>  <!-- Vue requires a single top level element in all templates -->
    <div class="contentCover" v-show="showModal" v-on:click="hideModal()"></div>
    <div class="content">
      <div class="pageText" v-show="pageText" v-html="pageText"></div>
      <TagList />
      <AlbumList />
      <Gallery />
    </div>
  </div>
</template>

<script>
import AlbumList from "@/components/AlbumList.vue";
import Gallery from "@/components/Gallery.vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import TagList from "@/components/TagList.vue";
import { mapState } from "vuex";

export default {
  name: "Content",
  components: {
    AlbumList,
    Gallery,
    HeaderTitle,
    TagList
  },
  computed: {
    pageText() {
      if (!this.album) { return null; }

      let text = this.album.description || '';
      if (this.album.time) {
        text += `<p class="meta">Posted ${this.album.time}</p>`;
      }
      return text;
    },
    ...mapState({
      album: state => state.album,
      showModal: state => state.coverContent
    })
  },
  methods: {
    hideModal() {
      this.$store.dispatch('coverContent', false);
    }
  }
};
</script>

<style lang="scss">
  .contentCover {
    height: 100%;
    left: 0px;
    position: fixed;
    top: 0px;
    width: 100%;
    z-index: 9;
  }

 .content {
    margin: $headerHeight 5px 5px 5px;
    left: 0;
    right: 0;
    z-index: 0;

    .item {
      cursor: pointer;
    }
  }

  .pageText {
    padding: 5px;
    line-height: 1.3em;

    .meta {
      font-size: $secondaryFontSize;
      color: $secondaryTextColor;
      margin: 0;
    }
  }

  @media only screen and (min-width: 768px) {
    .content {
      margin: $headerHeight 18px 18px 18px;
    }
  }
</style>
