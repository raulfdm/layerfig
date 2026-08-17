# Layerfig: JSON5 Example

Reading `.json5` / `.jsonc` config files with `@layerfig/parser-json5`, so your
config can carry comments and trailing commas.

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
npm i @layerfig/config @layerfig/parser-json5
```

Then pass it to the builder and point `FileSource` at a `.jsonc` (or `.json5`)
file:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import json5Parser from "@layerfig/parser-json5";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => z.object({ appURL: z.url() }).parse(finalConfig),
  parser: json5Parser,
})
  .addSource(new FileSource("base.jsonc"))
  .build();
```

`config/base.jsonc` uses a `//` comment, which plain `JSON.parse` would reject.
