# Layerfig: TOML Example

Reading `.toml` config files with `@layerfig/parser-toml`.

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

## What this example shows

Install the parser alongside the core package:

```bash
npm i @layerfig/config @layerfig/parser-toml
```

Then pass it to the builder and point `FileSource` at a `.toml` file:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import tomlParser from "@layerfig/parser-toml";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => z.object({ appURL: z.url() }).parse(finalConfig),
  parser: tomlParser,
})
  .addSource(new FileSource("base.toml"))
  .build();
```

Everything else — layering, slots, validation — works exactly as it does with
JSON.
