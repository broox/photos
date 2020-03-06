<template>
  <div>  <!-- Vue requires a single top level element in all templates -->
    <div class="contentCover" v-show="showModal" v-on:click="hideModal()"></div>
    <div class="content">
      <AlbumList />
      <Gallery />
    </div>
  </div>
</template>

<script>
import AlbumList from "@/components/AlbumList.vue";
import Gallery from "@/components/Gallery.vue";
import HeaderTitle from "@/components/HeaderTitle.vue";

export default {
  name: "Content",
  components: {
    AlbumList,
    Gallery,
    HeaderTitle
  },
  computed: {
    showModal() {
      return this.$store.state.coverContent;
    },
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
    z-index: 1;
  }

 .content {
    margin: $headerHeight 18px 18px 18px;
    left: 0;
    right: 0;
    z-index: 0;

    .item {
      cursor: pointer;
    }
  }
</style>
