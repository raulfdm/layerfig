# Layerfig: Client Environment Example

Splitting configuration between the **server** and the **client** in a React
Router (framework mode) app, so that secrets never leak into the browser bundle.

## Getting started

Install dependencies:

```bash
npm i
```

Run the server:

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

To run the production build locally:

```bash
npm run build
npm run preview
```

`start` is the same thing without `cross-env`, for deployment targets that supply
`NODE_ENV`, `PORT`, and `VITE_APP_ENV` themselves (see the Dockerfile).

## What this example shows

There are two config instances, built from the same schema:

| File                   | Import                      | Runs on          |
| ---------------------- | --------------------------- | ---------------- |
| `app/config/server.ts` | `@layerfig/config`          | server only      |
| `app/config/client.ts` | `@layerfig/config/client`   | server + browser |

`app/config/schema.ts` holds the single source of truth. The client config picks
only the fields that are safe to ship:

```ts
const ClientEnvSchema = ConfigSchema.pick({ env: true });
```

### Server config

`app/config/server.ts` reads `config/base.json` and layers `process.env` on top
via `EnvironmentVariableSource`. It has access to everything, so it must only be
used in loaders, actions, and other server-side code.

### Client config

`app/config/client.ts` uses the `/client` entrypoint with an `ObjectSource` and
`runtimeEnv: import.meta.env`. Vite **inlines** these values at build time, which
is why `VITE_APP_ENV` is set in the `dev`, `build`, and `start` scripts — the
value baked in during `build` is the one the browser sees at runtime.

`app/routes/home.tsx` renders both so you can compare them. Note the loader
returns the full server config purely to make the difference visible — doing that
in a real app would defeat the purpose.

## Deployment

To build and run with Docker:

```bash
docker build -t layerfig-client-env-example .
docker run -it --rm -p 3000:3000 layerfig-client-env-example
```

Two things the Dockerfile has to get right for Layerfig:

- `COPY ./config /app/config` — `FileSource` paths are resolved at **runtime**
  relative to `<process.cwd()>/config`, so the folder must exist in the final
  image. Bundlers never inline it.
- `ENV VITE_APP_ENV=production` is set in *both* the build stage (via the `build`
  script) and the runtime stage. The build-time value is baked into the client
  bundle; the runtime value is what the server config reads.
