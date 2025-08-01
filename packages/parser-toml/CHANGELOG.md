# @layerfig/parser-toml

## 5.0.0

### Major Changes

- 865babc: Align `parser-toml` version with other parsers versions.

## 4.0.0

### Major Changes

- 2d846ce: Remove v1 API support from `@layerfig/config`.

  This major version separates source modules from the core package. Consequently, static helpers like `ConfigBuilder.fileSource` have been removed. You must now import and instantiate sources directly from their own modules.

  For example:

  Before:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";

  import { schema } from "./schema";

  const config = new ConfigBuilder({
    validate: (fullConfig) => schema.parse(fullConfig),
  })
    .addSource(ConfigBuilder.fileSource("base.toml"))
    .addSource(ConfigBuilder.fileSource("live.toml"))
    .build();
  ```

  After:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  import { FileSource } from "@layerfig/config/sources/file";

  import { schema } from "./schema";

  const config = new ConfigBuilder({
    validate: (fullConfig) => schema.parse(fullConfig),
  })
    .addSource(new FileSource("base.toml"))
    .addSource(new FileSource("live.toml"))
    .build();
  ```

### Patch Changes

- 2d846ce: Update readme
- 2d846ce: Add support for `@layerfig/config` v2, expanding the allowed version range.
- 2d846ce: Update peerDependency range
- Updated dependencies [2d846ce]
- Updated dependencies [2d846ce]
- Updated dependencies [2d846ce]
- Updated dependencies [2d846ce]
- Updated dependencies [2d846ce]
  - @layerfig/config@2.0.0

## 4.0.0-next.4

### Patch Changes

- Updated dependencies [59a8819]
- Updated dependencies [28b5078]
  - @layerfig/config@2.0.0-next.4

## 4.0.0-next.3

### Patch Changes

- de30ea7: Update peerDependency range

## 4.0.0-next.2

### Major Changes

- cc53929: Remove v1 API support from `@layerfig/config`.

  This major version separates source modules from the core package. Consequently, static helpers like `ConfigBuilder.fileSource` have been removed. You must now import and instantiate sources directly from their own modules.

  For example:

  Before:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";

  import { schema } from "./schema";

  const config = new ConfigBuilder({
    validate: (fullConfig) => schema.parse(fullConfig),
  })
    .addSource(ConfigBuilder.fileSource("base.toml"))
    .addSource(ConfigBuilder.fileSource("live.toml"))
    .build();
  ```

  After:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  import { FileSource } from "@layerfig/config/sources/file";

  import { schema } from "./schema";

  const config = new ConfigBuilder({
    validate: (fullConfig) => schema.parse(fullConfig),
  })
    .addSource(new FileSource("base.toml"))
    .addSource(new FileSource("live.toml"))
    .build();
  ```

## 3.0.1-next.1

### Patch Changes

- 46dfe83: Update readme

## 3.0.1-next.0

### Patch Changes

- b4c3eb5: Add support for `@layerfig/config` v2, expanding the allowed version range.

## 3.0.0

### Patch Changes

- Updated dependencies [522badb]
  - @layerfig/config@1.0.0

## 2.0.0

### Patch Changes

- Updated dependencies [5d96393]
  - @layerfig/config@0.4.0
