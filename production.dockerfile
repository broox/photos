FROM node:9.5 AS client
RUN npm config set registry http://registry.npmjs.org/
RUN npm install --quiet --global @vue/cli

FROM python:3.7 AS server
COPY ./server /app
COPY requirements.txt /app/
WORKDIR /app
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

FROM client AS builder
COPY ./client /app
WORKDIR /app
RUN npm install
RUN npm run build

FROM server AS copier
COPY --from=builder /app/dist /app/dist
