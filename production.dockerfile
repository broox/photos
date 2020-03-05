FROM node:9.5
RUN npm config set registry http://registry.npmjs.org/ 
RUN npm install --quiet --global @vue/cli
COPY ./client /app
WORKDIR /app
RUN npm install
RUN  npm run build

FROM python:3.7
COPY ./server /app
COPY requirements.txt /app/
WORKDIR /app
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip
RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt