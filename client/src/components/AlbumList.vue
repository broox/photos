<template>
  <div class="albumList">
    <p class="photoCount" v-show="albumCount">{{ albumCountDisplay }}</p>
    <ul class="albums">
      <li v-for="(album, index) in albums" v-bind:key="index" v-on:click="selectAlbum(album)">
        <img :src="album.thumbnail">
        <p>{{album.title}}</p>
        <i>{{album.time}}</i>
      </li>
    </ul>
  </div>
</template>

<script>
import { pluralize } from "@/utils.js";
import { mapState } from "vuex";

// TODO: infinite scroll to the right
// or link to view that contains more albums

export default {
  name: "AlbumList",
  computed: {
    albumCountDisplay() {
      const albumCount = this.albumCount;
      if (albumCount) {
        return pluralize(albumCount, "album");
      }
    },
    ...mapState({
      albumCount: state => state.albums.count,
      albums: state => state.albums.albums
    })
  },
  methods: {
    selectAlbum(album) {
      this.$store.dispatch("selectAlbum", album);
    }
  }
};
</script>

<style lang="scss">
.albumList {
  margin: 5px;
}

.albumCount {
  color: $secondaryTextColor;
  margin: 5px 0;
  text-align: left;
}

ul.albums {
  display:flex;
  flex-flow: row nowrap;
  list-style-type: none;
  margin: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;

  li {
    cursor: pointer;
    display: inline-block;
    list-style: none;
    padding: 10px;
    white-space: normal;

    color: $primaryTextColor;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    &:first-child {
      padding-left: 0;
    }
  }

  img {
    border-radius: 10px;
    height: 150px;
    width: 150px;
  }

  p { 
    margin: 0;
  }

  i {
    color: $secondaryTextColor;
    font-size: 12px;
    font-style: normal;
  }
}
</style>