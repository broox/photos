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
import {pluralize, serializeAlbum } from "@/utils.js";
import Album from "@/models/album.js";

// TODO: fix search results clearing when exiting out of an album
//       - use vue router?
//       infinite scroll to the right

export default {
  name: "AlbumList",
  data: () => {
    return {
      albumCount: 0,
      albums: [],
    }
  },
  mounted() {
    if (this.query) {
      this.fetchAlbums();
    }
  },
  computed: {
    albumCountDisplay() {
      const albumCount = this.albumCount;
      if (albumCount) {
        return pluralize(albumCount, "album");
      }
    },
    query() {
      return this.$store.state.query;
    },
  },
  watch: {
    query(query) {
      console.log('query changed', query);
      this.albumCount = 0;
      this.albums = [];
      this.fetchAlbums();
    }
  },
  methods: {
    fetchAlbums() {
      // this.$refs.albums.scrollLeft = 0;
      console.log('refs', this.$refs);

      const lastAlbumQuery = this.query;
      const params = {
        limit: 40,
        search: this.query
      };
      return Album.fetchIndex(params)
        .then(data => {
          if (lastAlbumQuery !== this.query) {
            return;
          }
          this.albumCount = data.meta.count;
          this.albums = data.data.map(serializeAlbum);
        })
        .catch(err => {
          console.error("Error fetching albums", err);
        });
    },
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