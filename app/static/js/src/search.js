const ALBUM = 'album';
const TAG = 'tag';

Vue.component('Search', {
  props: [
    'initQuery',
    'modal'
  ],
  data: () => {
    return {
      albums: [],
      dropRealtimeResults: false, // prevent race conditions on full page / photo searches
      input: null,                // value displayed in the input form
      lastQuery: null,
      query: null,                // the currently active search
      tags: [],
    }
  },
  computed: {
    showRealtimeSearchResults() {
      const visible = this.albums.length > 0;
      this.$emit('modal', visible);
      return visible;
    },
    realtimeResults() {
      const albums = this.albums.map((album) => { return { type: ALBUM, display: album.title, album: album } });
      const tags = this.tags.map((tag) => { return { type: TAG, display: tag.name, tag: tag } });
      const results = tags.concat(albums);
      return results.slice(0, 10);
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
    initQuery(query) {
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
      this.query = null;
    },
    clearSearchForm() {
      this.input = null;
      this.clearRealtimeSearchResults();
      this.clearSearch();
      this.$emit('query', this.query);
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
      this.$emit('query', this.query);
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
          // TODO: emit tags?
        })
        .catch(err => {
          console.error('Error fetching tags', err);
        });
    },
    selectRealtimeSearch(result) {
      if (result.type === ALBUM) {
        return this.$emit(ALBUM, result.album);
      }

      if (result.type === TAG) {
        return this.$emit(TAG, result.tag);
      }
    },
    syncSearchForm() {
      if (this.query && this.input !== this.query) {
        this.input = this.query;
      }
    },
  }
});
