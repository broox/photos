import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

router.beforeEach((to, from, next) => {
  console.log(`Router.beforeEach from ${from.path} => ${to.path}`);
  store.dispatch("setLastPage", from);
  // store.dispatch('findCachedPage', to.path);
  next();
});

router.afterEach((to, from) => {
  // TODO: this will not cache if someone lands directly on a URL...
  console.log('Router.afterEach to:', to.path);
  // store.dispatch('cachePage', to.path);
});
