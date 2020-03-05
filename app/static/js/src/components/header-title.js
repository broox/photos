const HeaderTitle = Vue.component('HeaderTitle', {
  template: `
    <div class="galleryTitle">
      <i class="fas fa-chevron-left back" v-on:click="goBack"></i>
      <h1>{{ title }}</h1>
    </div>
  `,
  // data: () => {
  //   return {
  //     global: GlobalStore,
  //   }
  // },
  computed: {
    title() {
      return this.$store.state.title;
    }
  },
  methods: {
    goBack() {
      // TODO: check if there is history for this website in the router.
      // if so, use that, else go to showRecent()
      this.$root.showRecent();
    }
  }
});
