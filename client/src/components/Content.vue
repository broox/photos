<template>
  <div>  <!-- Vue requires a single top level element in all templates -->
    <div class="contentCover" v-show="showModal" v-on:click="hideModal()"></div>
    <div class="content">
      <div class="pageText" v-show="pageText" v-html="pageText"></div>
      <AlbumList />
      <Gallery />
    </div>
  </div>
</template>

<script>
import AlbumList from "@/components/AlbumList.vue";
import Gallery from "@/components/Gallery.vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import { mapState } from "vuex";

export default {
  name: "Content",
  components: {
    AlbumList,
    Gallery,
    HeaderTitle
  },
  computed: {
    pageText() {
      return this.album ? this.album.description : null;
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
  }

  @media only screen and (min-width: 768px) {
    .content {
      margin: $headerHeight 18px 18px 18px;
    }
  }
</style>
