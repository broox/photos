<template>
  <div class="search">
    <div class="header" id="pageHeader">  <!-- TODO: move this into header files? -->
      <HeaderSearch />
    </div>
    <!-- <div class="contentCover" v-show="showModal" v-on:click="toggleModal(false)"></div> -->
    <div class="content">
      <Gallery />
    </div>
  </div>
</template>

<script>
import HeaderSearch from "@/components/HeaderSearch.vue";
import Gallery from "@/components/Gallery.vue";

export default {
  name: "Search",
  components: {
    HeaderSearch,
    Gallery
  },
  created() {
    if (!this.$store.state.query) {
      const query = this.$router.currentRoute.params.query;
      this.$store.dispatch("search", query);
    }
  }
};
</script>
