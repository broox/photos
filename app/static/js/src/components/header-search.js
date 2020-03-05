const ALBUM = 'album';
const TAG = 'tag';

const HeaderSearch = Vue.component('HeaderSearch', {
  template: `
    <form class="wrap" v-on:submit.prevent="searchPhotos">
      <div class="search">
        <input type="text" class="searchInput" placeholder="Search Broox Photos" autocorrect="off" autocapitalize="off" v-model="input" v-on:input="realtimeSearch" v-on:paste="realtimeSearch" v-on:blur="syncSearchForm">
        <button type="submit" class="searchButton" v-show="!query">
          <i class="fas fa-search"></i>
        </button>
        <button type="button" class="clearSearch" v-show="query" v-on:click="clearSearchForm">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="realtimeSearchResults" v-show="showRealtimeSearchResults" v-cloak>
        <ul>
          <li v-for="result in realtimeResults" v-on:click="selectRealtimeSearch(result)" :class="result.type">
            <i class="fas fa-tag" v-if="result.type == 'tag'"></i>
            <i class="fas fa-images"v-if="result.type == 'album'"></i>
            {{ result.display }}
          </li>
        </ul>
      </div>
    </form>
  `,
  props: [
    'modal'
  ],
  data: () => {
    return {
      // global: GlobalStore,
      albums: [],
      dropRealtimeResults: false, // prevent race conditions on full page / photo searches
      input: null,                // value displayed in the input form
      lastQuery: null,
      query: null,                // the currently active search
      tags: [],
    }
  },
  computed: {
    globalQuery() {
      return this.$store.state.query;
    },
    showRealtimeSearchResults() {
      const visible = this.albums.length > 0;
      return visible;
    },
    realtimeResults() {
      const displayLimit = 10;
      const albums = this.albums.map((album) => { return { type: ALBUM, display: album.title, album: album } });
      let tags = this.tags.map((tag) => { return { type: TAG, display: tag.name, tag: tag } });

      const totalItems = this.albumCount + this.tagCount;
      const halfLimit = 5;
      if (totalItems > displayLimit && this.tagCount > halfLimit) {
        let tagLimit;
        if (this.tagCount > halfLimit && this.albumCount > halfLimit) {
          tagLimit = halfLimit;
        } else {
          tagLimit = displayLimit - this.albumCount
        }
        tags = tags.slice(0, tagLimit);
      }

      const results = tags.concat(albums).slice(0, displayLimit);
      const displayedAlbums = results.filter(result => result.type === ALBUM);
      const displayedTags = results.filter(result => result.type === TAG);
      const remainingResults = [];

      if (this.tagCount > displayedTags.length) {
        const remainingTags = this.tagCount - displayedTags.length;
        remainingResults.push(pluralize(remainingTags, 'more tag'));
      }

      if (this.albumCount > displayedAlbums.length) {
        const remainingAlbums = this.albumCount - displayedAlbums.length;
        remainingResults.push(pluralize(remainingAlbums, 'more album'));
      }

      if (remainingResults) {
        results.push({
          type: 'summary',
          display: remainingResults.join(' and ')
        });
      }
      return results;
    }
  },
  created() {
    document.onkeydown = (event) => {
      if (event.key === 'Escape') {
          this.clearRealtimeSearchResults();
      }
    }    
  },
  watch: {
    'globalQuery': function(query) {
      // FIXME: bug here...
      if (query !== this.query) {
        this.query = query;
        this.syncSearchForm();
      }
    },
    modal(visible) {
      if (!visible) {
        this.clearRealtimeSearchResults();
      }
    },
    input(value) {
      // Enable realtime search when input value changes
      this.dropRealtimeResults = false;
    }
  },
  methods: {
    clearRealtimeSearchResults(event) {
      this.albums = [];
      this.tags = [];
    },
    clearSearch() {
      this.query = null; // should this.query be using this.global.query instead?
      // this.global.query = null;
    },
    clearSearchForm() {
      this.input = null;
      this.clearRealtimeSearchResults();
      this.clearSearch();
      this.$root.showRecent();
    },
    realtimeSearch(event) {
      if (this.lastQuery == this.input) {
        return;
      }

      if (this.input.length > 2 && event.key !== 'Enter') {
        this.searchTags(this.input);
        this.searchAlbums(this.input);
        this.lastQuery = this.input;
      } else {
        this.clearRealtimeSearchResults();
        this.lastQuery = null;
      }
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
          console.error('Error fetching albums', err);
        });
    },
    searchPhotos() {
      this.clearRealtimeSearchResults();
      this.query = this.input;
      this.dropRealtimeResults = true;
      this.$root.search(this.query);
    },
    searchTags(query) {
      const params = {
        limit: 10,
        search: query
      };

      const lastTagQuery = query;  // TODO: move to lastRealtimeQuery?
      return Tag.fetchIndex(params)
        .then(data => {
          if (this.dropRealtimeResults || lastTagQuery !== query) {
            return;
          }
          this.tags = data.data;
          this.tagCount = data.meta.count;
        })
        .catch(err => {
          console.error('Error fetching tags', err);
        });
    },
    selectRealtimeSearch(result) {
      if (result.type === ALBUM) {
        this.$root.selectAlbum(result.album);
      } else if (result.type === TAG) {
        this.$root.selectTag(result.tag);
      }
    },
    syncSearchForm() {
      if (this.query && this.input !== this.query) {
        this.input = this.query;
      }
    },
  }
});
