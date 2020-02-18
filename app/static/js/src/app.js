const app = new Vue({
  el: '#app',
  data: {
    message: null
  },
  mixins: [photosMixin],
  beforeMount() {
    this.loadPhotos();
  }
})

const header = document.getElementById('pageHeader');
const sticky = header.offsetTop;
window.onscroll = () => {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}
