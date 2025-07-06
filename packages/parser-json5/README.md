# `@layerfig/parser-json5`

Load `.json`, `.jsonc` and `.json5` configurations within `@layerfig/config`.

## Getting started

Install the parser:

```bash
npm add @layerfig/parser-json5
```

Define it in the layerfig config:

```ts
import { ConfigBuilder } from "@layerfig/config";
import json5Parser from "@layerfig/parser-json5";
import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (fullConfig) => schema.parse(fullConfig),
  parser: json5Parser,
})
  .addSource(ConfigBuilder.fileSource("base.json5"))
  .addSource(ConfigBuilder.fileSource("live.json5"))
  .build();
```
