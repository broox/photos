FROM node:14.14

RUN npm config set registry http://registry.npmjs.org/ 
RUN npm install --quiet --global @vue/cli@^4.5.7

COPY ./client /app
WORKDIR /app
RUN npm install
