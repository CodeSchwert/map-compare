# FROM node:10
FROM ubuntu:18.04

WORKDIR /usr/src/map-compare-server

# install gdal
RUN apt-get update
RUN apt-get install -y gdal-bin

# install node.js and npm
RUN apt-get install -y apt-transport-https
RUN apt-get install -y gnupg2
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# carry on with map-compare-server build
COPY . .

RUN npm install

EXPOSE 9000

CMD ["npm", "start"]
