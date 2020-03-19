<template>
  <div>
    <Header :show-title="true" />
    <Content />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Content from "@/components/Content.vue";
import Tag from "@/models/tag.js";
import { serializeTag } from "@/utils.js";

export default {
  name: "Tag",
  components: {
    Header,
    Content
  },
  created() {
    if (!this.$store.state.tag) {
      const tag = this.$router.currentRoute.params.tag;
      console.log('tag is not set, look it up from the URL', tag);
      // todo: loading
      // todo: tag not found
      // todo: move this to store actions?
      return Tag.get(tag).then(data => {
        if (data != null) {
          this.$store.dispatch("selectTag", serializeTag(data));
        }
      });

    }
  }
};
</script>
