FROM node:lts-buster-slim AS builder
WORKDIR /app

COPY ./frontend ./frontend
COPY ./shared ./shared

WORKDIR /app/frontend
RUN npm run compile-all

FROM nginx:1.21.6

EXPOSE 8080

RUN rm /etc/nginx/conf.d/default.conf
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder ./app/frontend/out /usr/share/nginx/html/
