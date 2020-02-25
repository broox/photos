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
    }
  },
  computed: {
    showRealtimeSearchResults() {
      const visible = this.albums.length > 0;
      this.$emit('modal', visible);
      return visible;
    },
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
        this.searchAlbums(this.input);
        this.lastQuery = this.input;
      } else {
        this.clearRealtimeSearchResults();
        this.lastQuery = null;
      }
    },
    searchAlbums(query) {
      this.$emit('loading', true);
      const params = {
        limit: 15,
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
          this.$emit('loading', false);
        })
        .catch(err => {
          this.$emit('loading', false);
          console.error('Error fetching albums');
        });
    },
    searchPhotos() {
      this.clearRealtimeSearchResults();
      this.query = this.input;
      this.dropRealtimeResults = true;  
      this.$emit('query', this.query);
    },
    selectAlbum(album) {
      this.$emit('album', album);
    },
    syncSearchForm() {
      if (this.query && this.input !== this.query) {
        this.input = this.query;
      }
    },
  }
});
