# Layerfig: YAML Example

Reading `.yaml` / `.yml` config files with `@layerfig/parser-yaml`.

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
npm i @layerfig/config @layerfig/parser-yaml
```

Then pass it to the builder and point `FileSource` at a `.yaml` file:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import yamlParser from "@layerfig/parser-yaml";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => z.object({ appURL: z.url() }).parse(finalConfig),
  parser: yamlParser,
})
  .addSource(new FileSource("base.yaml"))
  .build();
```

Everything else — layering, slots, validation — works exactly as it does with
JSON.
