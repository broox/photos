function serializeAlbum(album) {
    album.url = `/${album.slug}`;
    album.thumbnail = `https://derek.broox.com/square/${album.slug}/${album.thumbnail_id}/${album.slug}.jpg`;
    album.time = album.created_at ? relativeTime(Date.parse(album.created_at)) : null;
  
    return album;
  }
  
  // TODO: fix search results clearing when exiting out of an album
  //       - use vue router?
  //       infinite scroll to the right
  Vue.component('AlbumList', {
    props: [
      'search'
    ],
    data: () => {
      return {
        albumCount: 0,
        albums: [],
      }
    },
    computed: {
      albumCountDisplay() {
        const albumCount = this.albumCount;
        if (albumCount) {
          return pluralize(albumCount, 'album');
        }
      }
    },
    watch: {
      search(query) {
        this.$refs.albums.scrollLeft = 0;
  
        if (!query) {
          this.albumCount = 0;
          this.albums = [];
        }
  
        const lastAlbumQuery = query;
        const params = {
          limit: 40,
          search: query
        };
        return Album.fetchIndex(params)
          .then(data => {
            if (lastAlbumQuery !== query) {
              return;
            }
            this.albumCount = data.meta.count;
            this.albums = data.data.map(serializeAlbum);
            console.log(this.albumCount);
            console.log(this.albums);
          })
          .catch(err => {
            console.error('Error fetching albums', err);
          });
      }
    },
    methods: {
      selectAlbum(album) {
        this.$emit('album', album);
      }
    }
  });