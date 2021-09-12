# FROM ubuntu:latest
# MAINTAINER Veronica
# RUN apt-get update
# RUN apt-get install nodejs
# RUN apt-get clean

# COPY ./package.json src/

# RUN cd src && npm install

# COPY . /src

# WORKDIR src/

# CMD ["npm", "start"]
FROM node:12.18.1
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "npm", "start" ]
