FROM node:lts-buster-slim AS builder
WORKDIR /app

COPY ./backend ./backend
COPY ./shared ./shared

WORKDIR /app/backend
RUN npm run compile-all

EXPOSE 8000

RUN chown -R node /app
USER node
