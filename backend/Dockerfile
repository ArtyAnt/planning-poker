# define build source
ARG SOURCE_STAGE=full

# copy pre-built artifacts
FROM scratch AS build-local-fs
COPY ./backend/out /app/out
COPY ./backend/node_modules /app/node_modules

FROM node:lts-buster-slim AS build-full

WORKDIR /build
COPY ./backend ./backend
COPY ./shared ./shared

WORKDIR /build/backend
RUN npm run compile-all

WORKDIR /app
RUN mv /build/backend/out /build/backend/node_modules /app/

# define artifact source
FROM build-${SOURCE_STAGE} AS artifact-source

# resulting stage
FROM node:lts-buster-slim

WORKDIR /app
COPY --from=artifact-source --chown node:node /app

USER node
EXPOSE 8000

CMD ["node", "/app/out/src/index.js"]
