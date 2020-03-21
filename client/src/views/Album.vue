<template>
  <div>
    <Header :show-title="true" />
    <Content />
  </div>
</template>

<script>
import Album from "@/models/album.js";
import Header from "@/components/Header.vue";
import Content from "@/components/Content.vue";
import { serializeAlbum } from "@/utils.js";

export default {
  name: "Album",
  components: {
    Header,
    Content
  },
  created() {
    const stateAlbum = this.$store.state.album;
    const urlAlbum = this.$router.currentRoute.params.album;
    if (!stateAlbum || stateAlbum.slug != urlAlbum) {
      // View was loaded via direct-link, or by navigating back/forward
      // through history

      // todo: loading
      // todo: album not found
      // todo: move this to store actions?
      return Album.get(urlAlbum).then(data => {
        if (data != null) {
          this.$store.dispatch("selectAlbum", serializeAlbum(data));
        }
      });
    }
  }
};
</script>
