# Layerfig: Multi-staged Docker Example

Packaging a Layerfig app into a multi-stage Docker image, keeping the config
files available at runtime.

## Getting started

Install dependencies:

```bash
npm i
```

Run the server:

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

## Running the container

First, build the image:

```bash
docker build -t layerfig-docker-example .
```

Now, run the container:

```bash
docker run -it --rm -p 5173:5173 layerfig-docker-example
```

## What this example shows

Layerfig resolves `FileSource` paths at **runtime**, relative to
`<process.cwd()>/config`. Bundlers therefore never inline them, which means the
`config/` folder has to be copied into the final image:

```dockerfile
## Output from build step on builder stage
COPY --from=builder /app/dist ./dist
## Production server
COPY server.js ./
## Include config files
COPY ./config ./config
```

Forgetting that last line is the usual cause of a container that builds fine but
crashes on boot with a missing-config error.

The production stage installs with `npm ci --omit=dev`, so build-only tools
(Vite, TypeScript) stay out of the shipped image.
