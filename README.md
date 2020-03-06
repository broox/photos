# Broox Photos

This is a simple photo gallery web application built to interact with my personal photos API.

The front-end is a single-page application built with [Vue](https://vuejs.org/), [FlexImages](https://github.com/Pixabay/JavaScript-flexImages), and [Photoswipe](https://github.com/dimsemenov/photoswipe).

The Vue application is using Vue CLI, Vue Router, Single file components, and Vuex for storing state. I went all-in on a Vue single page app, because I hadn't gotten to develop anything on the client-side for a few years and it seemed like a fun project to learn with.

The backend-end is a lightweight python ([flask](https://github.com/pallets/flask)) application that proxies requests to the API.

## Development

This does not start the Vue CLI node server with hot reloading because I was having trouble running it alongside my flask backend with docker.

```
docker-compose -f docker-compose.dev.yml up
```

This starts a Flask server and watches all of the client-side files for changes to build them accordingly.

Hit `localhost:5000/` to test it out.

### Production

This uses a multi-stage dockerfile to build and minify the static files and then start the Flask server in production mode.

```
docker-compose up
```

To re-build the app after checking out new code in production, do not stop the server (via `docker-compose stop` or `down`). Simply run `docker-compose up --build -d` to build the new application while the current app is running. Once it's done building, it will be running in detached mode.
