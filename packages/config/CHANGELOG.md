# @layerfig/config

## 0.3.0

### Minor Changes

- e5cc87f: Remove lodash-es in favor of zero depedency

## 0.2.0

### Minor Changes

- 9c6b954: BREAKING CHANGE: YAML and JSONC-like files are no longer supported out of the box.

  Previously, the library supported these file extensions by default. To reduce the project's dependencies for applications that only require basic `.json` files, support for other file types is now optional.

  We now offer dedicated parser packages under the `@layerfig/parser-*` scope to handle specific file types.

  If you use YAML files (`.yaml`, `.yml`), you must install the `@layerfig/parser-yaml` package and configure it:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  // Import parser
  import yamlParser from "@layerfig/parser-yaml";

  export const config = new ConfigBuilder({
    validate: (finalConfig) => schema.parse(finalConfig),
    // Define parser
    parser: yamlParser,
  })
    .addSource("base.yaml")
    .addSource("live.yml")
    .build();
  ```

  Similarly, for `.jsonc` and `.json5` files, you need to install the `@layerfig/parser-json5` package and use it:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  // Import parser
  import json5Parser from "@layerfig/parser-json5";

  export const config = new ConfigBuilder({
    validate: (finalConfig) => schema.parse(finalConfig),
    // Define parser
    parser: json5Parser,
  })
    .addSource("base.jsonc")
    .addSource("live.json5")
    .build();
  ```

## 0.1.0

### Minor Changes

- 1be6cde: remove zod from `peerDependency`.

  Also, changes the API to accept a validate function instead a schema:

  Before:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  import { z } from "zod/v4";

  export const schema = z.object({
    appURL: z.url(),
    port: z.number(),
  });

  export const config = new ConfigBuilder(schema)
    .addSource("base.jsonc")
    .addSource("live.jsonc")
    .build();
  ```

  After

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  import { z } from "zod/v4";

  export const schema = z.object({
    appURL: z.url(),
    port: z.number(),
  });

  export const config = new ConfigBuilder({
    validate: (config) => schema.parse(config),
  })
    .addSource("base.jsonc")
    .addSource("live.jsonc")
    .build(); // type safe with the return type of Validate
  ```
