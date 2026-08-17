# Layerfig: Valibot Example

Validating your config with [Valibot](https://valibot.dev/) instead of the
bundled Zod.

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

`validate` is just a function: it receives the merged config and returns the
parsed value. Whatever it returns becomes the type of `config`, so any validation
library works — the second `z` argument is a convenience, not a requirement.

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import * as v from "valibot";

export const configSchema = v.object({
  appURL: v.pipe(v.string(), v.url()),
});

export const config = new ConfigBuilder({
  validate: (finalConfig) => v.parse(configSchema, finalConfig),
})
  .addSource(new FileSource("base.json"))
  .build();
```

The same approach works for ArkType, Yup, io-ts, or a hand-written function.
