FROM node:20.12-alpine
LABEL maintainer "ODL DevOps <mitx-devops@mit.edu>"

# Allows Jest to be run in --watch mode alongside the mounted .git repo
RUN apk update && apk add git
ENV GIT_WORK_TREE=/src GIT_DIR=/src/.git

COPY ./package.json /src/
COPY ./yarn.lock /src/
COPY ./.yarnrc.yml /src/
COPY ./.yarn /src/.yarn
COPY ./frontends /src/frontends

WORKDIR /src

RUN yarn set version 4.1.1
RUN yarn install

# Rebuilds for the case that the lockfile contains platform-specific dependencies
RUN yarn rebuild

WORKDIR /src/frontends

RUN yarn build-storybook

CMD ["yarn", "watch:docker"]
