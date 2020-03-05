<template>
  <div class="album">
    <Header :show-title="true" />
    <Content />
  </div>
</template>

<script>
import Album from "@/models/album.js";
import Header from "@/components/Header.vue";
import Content from "@/components/Content.vue";

export default {
  name: "Album",
  components: {
    Header,
    Content
  },
  created() {
    if (!this.$store.state.album) {
      const album = this.$router.currentRoute.params.album;
      // todo: loading
      // todo: album not found
      // todo: move this to store actions?
      return Album.get(album).then(data => {
        if (data != null) {
          this.$store.dispatch("selectAlbum", data);
        }
      });
    }
  }
};
</script>
