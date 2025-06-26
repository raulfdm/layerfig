# `@layerfig/parser-yaml`

Load `.yaml` or `.yml` configuration within `@layerfig/config`.

## Getting started

Install the parser:

```bash
npm add @layerfig/parser-yaml
```

Define it in the layerfig config:

```ts
import { ConfigBuilder } from "@layerfig/config";
import yamlParser from "@layerfig/parser-yaml";
import { schema } from "./schema";

const config = new ConfigBuilder({
  validate: (fullConfig) => schema.parse(fullConfig),
  parser: yamlParser,
})
  .addSource("base.yaml")
  .addSource("live.yml")
  .build();
```
