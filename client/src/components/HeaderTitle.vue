<template>
  <div class="galleryTitle">
    <i class="fas fa-chevron-left back" v-on:click="goBack"></i>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
  export default {
    name: 'HeaderTitle',
    computed: {
      title() {
        return this.$store.state.title;
      }
    },
    methods: {
      goBack() {
        if (this.$store.state.lastPage) {
          this.$router.go(-1)
        } else {
          this.$store.dispatch('selectFeed');
        }
      }
    }
  };
</script>

<style lang="scss">
  .galleryTitle {
    height: $headerHeight;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;

    .back {
      cursor: pointer;
      padding: 20px;
    }

    h1 {
      display: inline-block;
      font-size: $titleFontSize;
      margin: 0;
      overflow: hidden;
      padding: 0 10px 0 0;
      text-overflow: ellipsis;
      white-space: nowrap;

      /* span {
        color: #999;
        font-size: 0.6em;
        margin-left: 0.6em;
      } */
    }
  }
</style>