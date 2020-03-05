FROM node:9.5

RUN npm config set registry http://registry.npmjs.org/ 
RUN npm install --quiet --global @vue/cli

COPY ./client /app
WORKDIR /app
RUN npm install