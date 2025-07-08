# `@layerfig/parser-toml`

Load `.toml` configuration within `@layerfig/config`.

## Getting started

Install the parser:

```bash
npm add @layerfig/parser-toml
```

Define it in the layerfig config:

```ts
import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
import tomlParser from "@layerfig/parser-toml";

import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (fullConfig) => schema.parse(fullConfig),
  parser: tomlParser,
})
  .addSource(new FileSource("base.toml"))
  .addSource(new FileSource("live.toml"))
  .build();
```
