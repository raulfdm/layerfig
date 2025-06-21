# Phase 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Phase 2: Prepare the production image
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --include=prod

## Output from build step on builder stage
COPY --from=builder /app/dist ./dist
## Production server
COPY server.js ./
## Include config files
COPY ./config ./config

EXPOSE 5173

CMD ["node", "server.js"]
