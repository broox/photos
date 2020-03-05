import Vue from "vue";
import VueRouter from "vue-router";

import Album from "../views/Album.vue";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Search from "../views/Search.vue";
import Tag from "../views/Tag.vue";
// import Gallery from "../components/Gallery.vue";
// import HeaderSearch from "../components/HeaderSearch.vue";
// import HeaderTitle from "../components/HeaderTitle.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
    //   components: { header: HeaderSearch, content: Gallery }
  },
  {
    path: "/search/:query",
    name: "Search",
    component: Search
    // components: { header: HeaderSearch, content: Gallery }
  },
  {
    path: "/tagged/:tag",
    name: "Tag",
    component: Tag
    // components: { header: HeaderTitle, content: Gallery }
  },
  {
    path: "/:album",
    name: "Album",
    component: Album
    // components: { header: HeaderTitle, content: Gallery }
  },
  { path: "*", name: "404", component: NotFound }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
