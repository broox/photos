<template>
  <div id="app">
    <router-view :key="$route.fullPath"></router-view>
    <!--
      :key is needed in order to force a re-render when navigating back
      and forth between routes that render the same View. e.g. searching
      for `kari`, then searching for `jeff`, and then hitting the back
      button to look at `kari` again
    -->
  </div>
</template>

<script>
  // KILLME?
  export default {
    name: "App",
    updated() {
      console.log('App.updated');
    }
  }
</script>

<style lang="scss">
  @import "~@/assets/styles/fontawesome.min.css";
  @import "~@/assets/styles/fontawesome-solid.min.css";

  body {
    color: $primaryTextColor;
    font-family: Helvetica, Arial, sans-serif;
    font-size: $primaryFontSize;
    margin: 0;
  }
</style>
