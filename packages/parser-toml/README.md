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
import tomlParser from "@layerfig/parser-toml";
import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (fullConfig) => schema.parse(fullConfig),
  parser: tomlParser,
})
  .addSource(ConfigBuilder.fileSource("base.toml"))
  .addSource(ConfigBuilder.fileSource("live.toml"))
  .build();
```
