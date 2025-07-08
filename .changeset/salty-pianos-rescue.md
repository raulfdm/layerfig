---
"@layerfig/parser-json5": major
"@layerfig/parser-toml": major
"@layerfig/parser-yaml": major
---

Remove v1 API support from `@layerfig/config`.

This major version separates source modules from the core package. Consequently, static helpers like `ConfigBuilder.fileSource` have been removed. You must now import and instantiate sources directly from their own modules.

For example:

Before:

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

After:

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
