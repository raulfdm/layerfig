# Layerfig: Basic Node.js Example

The smallest useful Layerfig setup: one config file, one schema, one typed
config object.

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

To run the production build:

```bash
npm run build
npm run preview
```

## What this example shows

`src/config.ts` builds the config from a single `FileSource`, validated with the
Zod instance Layerfig hands to `validate`:

```ts
export const config = new ConfigBuilder({
  validate: (finalConfig, z) => z.object({ appURL: z.url() }).parse(finalConfig),
})
  .addSource(new FileSource("base.json"))
  .build();
```

`FileSource` paths are resolved relative to the `config/` folder at the project
root, so `"base.json"` reads `config/base.json`.

`src/entry-server.ts` renders the resulting object so you can see it in the page.
