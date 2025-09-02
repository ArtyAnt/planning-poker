# define build source
ARG SOURCE_STAGE=full

# copy pre-built artifacts
FROM scratch AS build-local-fs
COPY ./frontend/out /usr/share/nginx/html

FROM node:lts-buster-slim AS build-full

WORKDIR /build
COPY ./frontend ./frontend
COPY ./shared ./shared

WORKDIR /build/frontend
RUN npm run compile-all

WORKDIR /usr/share/nginx
RUN mv /build/frontend/out ./html

# define artifact source
FROM build-${SOURCE_STAGE} AS artifact-source

# resulting stage
FROM nginx:1.21.6

COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=artifact-source /usr/share/nginx/html /usr/share/nginx/html

EXPOSE 8080
