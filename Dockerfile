FROM node:alpine

# App setup

ADD client/docker-bundle.tgz /

WORKDIR /app

RUN yarn --prod

# Configuration

ENV NODE_CONFIG_DIR=/config
ENV PORT 80
EXPOSE 80
VOLUME /snacksable
VOLUME /config

CMD yarn start -p ${PORT}
