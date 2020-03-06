<template>
  <div>
    <Header />
    <Content />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Content from "@/components/Content.vue";

export default {
  name: "Search",
  components: {
    Header,
    Content
  },
  created() {
    if (!this.$store.state.query) {
      const query = this.$router.currentRoute.params.query;
      this.$store.dispatch("search", query);
    }
  }
};
</script>
