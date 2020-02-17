# Photos

A simple photo gallery web application built to interact with the broox API.

The front-end is built with [Vue](https://vuejs.org/), [FlexImages](https://github.com/Pixabay/JavaScript-flexImages), and [Photoswipe](https://github.com/dimsemenov/photoswipe).

The backend-end is a lightweight python ([flask](https://github.com/pallets/flask)) application that proxies requests to the API.

## Building assets:

1. Run `npm install`
1. Run `gulp`

## Running:

1. Run `docker-compose build`
1. Run `docker-compose up` (or `docker-compose -f docker-compose-dev.yml up` when running locally)
1. Hit `localhost:5000/
