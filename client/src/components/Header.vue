<template>
  <div class="header" id="pageHeader">
    <HeaderTitle v-if="showTitle" />
    <HeaderSearch v-else />
  </div>
</template>

<script>
import HeaderSearch from "@/components/HeaderSearch.vue";
import HeaderTitle from "@/components/HeaderTitle.vue";

export default {
  name: "Header",
  components: {
    HeaderSearch,
    HeaderTitle
  },
  props: ['showTitle'],
  mounted() {
    const header = document.getElementById('pageHeader');
    const sticky = header.offsetTop;
    window.onscroll = () => {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };
  }
};
</script>

<style lang="scss">
  .header {
    background-color: #fff;
    left: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    z-index: 10;

    height: $headerHeight;
  }

  .sticky {
    transform: translateY(0) translateZ(0);
    transition: transform linear 90ms;
    opacity: 1;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  }
</style>
