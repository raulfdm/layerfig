# Layerfig: Slots Example

## Getting started

Install dependencies:

```bash
npm i
```

Run the server:

```bash
npm run dev
```

This loads `config/base.json` and `config/development.json`. To see it consuming
the production layer, run:

```bash
npm run preview
```

## What this example shows

`config/base.json` covers the slot syntax:

- `${PORT}`: plain environment variable.
- `${self.port}`: self-reference, using another config value.
- `${APP_VERSION::-not set}`: literal fallback when the variable is not defined.
- `${DEBUG_LEVEL::LEGACY_DEBUG_LEVEL}`: chained variables, first one wins.

`config/development.json` (and `config/production.json`) shows that a
self-reference is **not** limited to the file it was declared in:

```json
// config/development.json
{
  "healthCheckURL": "http://localhost:${self.port}/health"
}
```

`port` is only defined in `config/base.json`, but since slots are resolved after
all sources are merged, `${self.port}` points to the final, merged value.
