# Layerfig: Dynamic Environment Example

Choosing which config layer to load at runtime, based on an environment
variable.

## Getting started

Install dependencies:

```bash
npm i
```

Run the server:

```bash
npm run dev
```

This runs with `APP_ENV=local`, so it loads `config/base.json` and
`config/local.json`. To see it consuming `prod`, run:

```bash
npm run preview
```

Either way the app is available at `http://localhost:5173`.

## What this example shows

`src/config.ts` validates `APP_ENV` *before* building the config, then uses it to
pick the second source:

```ts
const AppEnv = z.enum(["local", "prod"]);
const env = AppEnv.parse(process.env.APP_ENV);

export const config = new ConfigBuilder({ /* ... */ })
  .addSource(new FileSource("base.json"))
  .addSource(new FileSource(`${env}.json`))
  .build();
```

Sources are merged in order, so `local.json` / `prod.json` override anything
they redefine from `base.json`. Validating `APP_ENV` up front means a typo fails
loudly at startup instead of silently loading a missing layer.
