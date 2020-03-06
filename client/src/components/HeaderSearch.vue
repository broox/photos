<template>
  <form class="wrap" v-on:submit.prevent="searchPhotos">
    <div class="search">
      <input
        type="text"
        class="searchInput"
        placeholder="Search Broox Photos"
        autocorrect="off"
        autocapitalize="off"
        v-model="input"
        v-on:input="realtimeSearch"
        v-on:paste="realtimeSearch"
        v-on:blur="resetSearchForm"
      />
      <button type="submit" class="searchButton" v-show="!query">
        <i class="fas fa-search"></i>
      </button>
      <button type="button" class="clearSearch" v-show="query" v-on:click="clearSearchForm">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="realtimeSearchResults" v-show="showRealtimeSearchResults">
      <ul>
        <li
          v-for="(result, index) in realtimeResults"
          v-bind:key="index"
          v-on:mousedown="selectRealtimeSearch(result)"
          :class="result.type"
        >
          <i class="fas fa-tag" v-if="result.type == 'tag'"></i>
          <i class="fas fa-images" v-if="result.type == 'album'"></i>
          {{ result.display }}
        </li>
      </ul>
    </div>
  </form>
</template>

<script>
import Album from "@/models/album.js";
import Tag from "@/models/tag.js";
import { pluralize } from "@/utils.js";

const ALBUM = "album";
const TAG = "tag";
const SUMMARY = "summary";

export default {
  name: "HeaderSearch",
  // props: ["modal"],
  data: () => {
    return {
      albums: [],
      dropRealtimeResults: false, // prevent race conditions on full page / photo searches
      input: null,                // value displayed in the input form
      realtimeSearchDelay: null,
      tags: []
    };
  },
  computed: {
    coverContent() {
      return this.$store.state.coverContent;
    },
    query() {
      return this.$store.state.query;
    },
    showRealtimeSearchResults() {
      return (this.albums.length > 0 || this.tags.length > 0);
    },
    realtimeResults() {
      const displayLimit = 10;
      const albums = this.albums.map(album => {
        return { type: ALBUM, display: album.title, album: album };
      });
      let tags = this.tags.map(tag => {
        return { type: TAG, display: tag.name, tag: tag };
      });

      const totalItems = this.albumCount + this.tagCount;
      const halfLimit = 5;
      if (totalItems > displayLimit && this.tagCount > halfLimit) {
        let tagLimit;
        if (this.tagCount > halfLimit && this.albumCount > halfLimit) {
          tagLimit = halfLimit;
        } else {
          tagLimit = displayLimit - this.albumCount;
        }
        tags = tags.slice(0, tagLimit);
      }

      const results = tags.concat(albums).slice(0, displayLimit);
      const displayedAlbums = results.filter(result => result.type === ALBUM);
      const displayedTags = results.filter(result => result.type === TAG);
      const remainingResults = [];

      if (this.tagCount > displayedTags.length) {
        const remainingTags = this.tagCount - displayedTags.length;
        remainingResults.push(pluralize(remainingTags, "more tag"));
      }

      if (this.albumCount > displayedAlbums.length) {
        const remainingAlbums = this.albumCount - displayedAlbums.length;
        remainingResults.push(pluralize(remainingAlbums, "more album"));
      }

      if (remainingResults) {
        results.push({
          type: SUMMARY,
          display: remainingResults.join(" and ")
        });
      }
      return results;
    }
  },
  created() {
    document.onkeydown = event => {
      if (event.key === "Escape") {
        this.resetSearchForm();
      }
    };
  },
  mounted() {
    this.resetSearchForm();
  },
  watch: {
    coverContent(visible) {
      // If content cover disappears, it was either tapped, or dismissed due to
      // no realtime results being returned from the current input. Only clear
      // the search results and revert the input value has gone away and the
      // input does not currently have focus.
      const searchField = document.querySelectorAll(".searchInput")[0];
      if (!visible && searchField != document.activeElement) {
        this.resetSearchForm();
      }
    },
    query() {
      this.resetSearchForm();
    },
    showRealtimeSearchResults(visible) {
      this.$store.dispatch('coverContent', visible);
    },
    input() {
      // Enable realtime search when input value changes
      this.dropRealtimeResults = false;
    }
  },
  methods: {
    clearRealtimeSearchResults() {
      this.albums = [];
      this.tags = [];

      // This should be automatically happening when the album and tags are emptied...
      // I saw some weirdness with it not working tho.
      this.$store.dispatch('coverContent', false);
    },
    clearSearchForm() {
      this.$store.dispatch('selectFeed');
    },
    realtimeSearch(event) {
      if (this.input.length <= 1 || event.key === "Enter") {
        this.clearRealtimeSearchResults();
        return;
      }

      clearTimeout(this.realtimeSearchDelay);

      // TODO: keep a cache of key/value pairs for the latest n realtime search results
      // { 'ka': [<results>], 'kar': [<results>] }
      // immediately return those if they exist. otherwise wait the half second to do the ajax query
      // allows for easy backspacing
      this.realtimeSearchDelay = setTimeout(() => {
        this.searchTags(this.input);
        this.searchAlbums(this.input);
      }, 400);
    },
    searchAlbums(query) {
      const params = {
        limit: 10,
        search: query
      };

      const lastAlbumQuery = query;
      return Album.fetchIndex(params)
        .then(data => {
          if (this.dropRealtimeResults || lastAlbumQuery !== query) {
            return;
          }
          this.albums = data.data;
          this.albumCount = data.meta.count;
          // TODO: emit albums?
        })
        .catch(err => {
          console.error("Error fetching albums", err);
        });
    },
    searchPhotos() {
      // This is triggered by a `mousedown` event from the realtime search
      // results' "more" row because, when tapping out of the search input
      // field a `blur` event is fired. When focus is lost by tapping outside
      // of a field, the event order goes: mousedown => blur => click. So, we
      //  submit the form at `mousedown` instead of `click` to prevent
      // `resetSearchForm` from resetting the desired search term.

      this.clearRealtimeSearchResults();
      this.dropRealtimeResults = true;
      this.$store.dispatch("search", this.input);
    },
    searchTags(query) {
      const params = {
        limit: 10,
        search: query
      };

      const lastTagQuery = query; // TODO: move to lastRealtimeQuery?
      return Tag.fetchIndex(params)
        .then(data => {
          if (this.dropRealtimeResults || lastTagQuery !== query) {
            return;
          }
          this.tags = data.data;
          this.tagCount = data.meta.count;
        })
        .catch(err => {
          console.error("Error fetching tags", err);
        });
    },
    selectRealtimeSearch(result) {
      if (result.type === ALBUM) {
        this.$store.dispatch("selectAlbum", result.album);
      } else if (result.type === TAG) {
        this.$store.dispatch("selectTag", result.tag);
      } else if (result.type === SUMMARY) {
        this.searchPhotos();
      }
    },
    resetSearchForm() {
      if (!this.query) {
        // Input blurred while there are characters in the search field on the
        // HOME page
        this.input = "";
      } else if (this.query && this.input !== this.query) {
        // Input blurred while there are different characters in the search
        // field than the current search results that are being displayed
        this.input = this.query;
      }
      this.clearRealtimeSearchResults();
    }
  }
};
</script>

<style lang="scss">
  .wrap {
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    border-radius: 5px;
    margin: 10px;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background-color: #fff;
  }

  .search {
    width: 100%;
    position: relative;
    display: flex;
  }

  .searchInput {
    background: #fff;
    border: none;
    color: $primaryTextColor;
    font-size: 18px;
    height: 20px;
    margin: 4px 7px;
    outline: none;
    padding: 5px;
    width: 100%;

    &::placeholder {
      color: $inputPlaceholderTextColor;
    }
    
    &:-ms-input-placeholder {
      color: $inputPlaceholderTextColor;
    }
    
    &::-ms-input-placeholder {
      color: $inputPlaceholderTextColor;
    }
    
    &:focus{
      color: $primaryTextColor;
    }
  }

  .realtimeSearchResults {
    border-top: 1px solid #ddd;
    display: flex;

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      width: 100%;
    
      li {
        cursor: pointer;
        overflow: hidden;
        padding: 10px 12px;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.summary {
          color: $inputPlaceholderTextColor;
          font-size: 0.9em;
          text-align: center;
        }

        &:hover {
          background-color: #eee;
        }

        &:last-child {
          border-radius: 0 0 5px 5px;
        }

        .fas {
          margin-right: 12px;
        }
      }
    }  
  }

  .searchButton, .clearSearch {
    background: #fff;
    border: none;
    border-radius: 0 5px 5px 0;
    color: #ccc;
    cursor: pointer;
    font-size: 20px;
    height: 30px;
    margin: 4px 7px;
    text-align: center;
    width: 40px;
  }
</style>