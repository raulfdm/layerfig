# `@layerfig/parser-toml`

Load `.toml` configuration within `@layerfig/config`.

## Getting started

Install the parser:

```bash
npm add @layerfig/parser-toml
```

Define it in the layerfig config:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import tomlParser from "@layerfig/parser-toml";

import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (finalConfig) => schema.parse(finalConfig),
  parser: tomlParser,
})
  .addSource(new FileSource("base.toml"))
  .addSource(new FileSource("production.toml"))
  .build();
```
