# `@layerfig/parser-yaml`

Load `.yaml` or `.yml` configuration within `@layerfig/config`.

## Getting started

Install the parser:

```bash
npm add @layerfig/parser-yaml
```

Define it in the layerfig config:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
import yamlParser from "@layerfig/parser-yaml";

import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (finalConfig) => schema.parse(finalConfig),
  parser: yamlParser,
})
  .addSource(new FileSource("base.yaml"))
  .addSource(new FileSource("production.yaml"))
  .build();
```
