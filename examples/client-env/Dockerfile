FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24-alpine
COPY ./package.json package-lock.json server.js /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
## Layerfig resolves FileSource paths at runtime, relative to <cwd>/config
COPY ./config /app/config
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV VITE_APP_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]