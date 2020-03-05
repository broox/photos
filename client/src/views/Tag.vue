<template>
  <div class="tag">
    <Header :show-title="true" />
    <Content />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Content from "@/components/Content.vue";
import Tag from "@/models/tag.js";

export default {
  name: "Tag",
  components: {
    Header,
    Content
  },
  created() {
    if (!this.$store.state.tag) {
      const tag = this.$router.currentRoute.params.tag;
      console.log('lookup tag', tag);
      // todo: loading
      // todo: tag not found
      // todo: move this to store actions?
      return Tag.get(tag).then(data => {
        if (data != null) {
          this.$store.dispatch("selectTag", data);
        }
      });

    }
  }
};
</script>
