<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  // KILLME?
  export default {
    name: "App",
  }
</script>

<style lang="scss">
  @import "~@/assets/styles/fontawesome.min.css";
  @import "~@/assets/styles/fontawesome-solid.min.css";

  body {
    color: $primaryTextColor;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 18px;
    margin: 0;
  }
</style>
