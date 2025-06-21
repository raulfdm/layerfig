FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN rm -rf node_modules
RUN npm install

COPY . .

RUN npm run build