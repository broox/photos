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
    const stateQuery = this.$store.state.query;
    const urlQuery = this.$router.currentRoute.params.query;
    if (!stateQuery || stateQuery != urlQuery) {
      // View was loaded via direct-link, or by navigating back/forward
      // through history
      this.$store.dispatch("search", urlQuery);
    }
  }
};
</script>
