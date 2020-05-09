import Vue from "vue";
import VueRouter from "vue-router";

import Album from "../views/Album.vue";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Search from "../views/Search.vue";
import Tag from "../views/Tag.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/search/:query",
    name: "Search",
    component: Search
  },
  {
    path: "/tagged/:tag",
    name: "Tag",
    component: Tag
  },
  {
    path: "/:album",
    name: "Album",
    component: Album
  },
  { path: "*", name: "404", component: NotFound }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
