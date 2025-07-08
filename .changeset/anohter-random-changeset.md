---
"@layerfig/config": major
---

BREAKING CHANGE:

## .addSource() API Change

The API for loading a file source has changed. Instead of passing a file path as a string, you now import a source from the new `/sources/*` sub-modules and define it:

```diff
import { ConfigBuilder } from "@layerfig/config"
+import { FileSource } from "@layerfig/config/sources/file"
+import { EnvironmentVariableSource } from "@layerfig/config/sources/env"

const config = new ConfigBuilder({
  validate: (finalConfig) => finalConfig,
})
-  .addSource("config.json")
+  .addSource(new FileSource("config.json"))
-  .addSource(ConfigBuilder.createEnvVarSource(options))
+  .addSource(new EnvironmentVariableSource(options))
  .build()
```

Under the hood, both the file source and the environment source now extend from a common base class. This change simplifies maintenance and makes it easier to implement future extensions.

## `runtimeEnv` Moved to `ConfigBuilder`

The `EnvironmentVariableSource` no longer accepts the `runtimeEnv` option.

Previously, you could pass a runtime environment directly to the source:

```ts
const config = new ConfigBuilder({
  validate: (finalConfig) => finalConfig,
})
  .addSource(
    ConfigBuilder.createEnvVarSource({
      runtimeEnv: import.meta.env, // from here...
    })
  )
  .build();
```

This option has been moved to the `ConfigBuilder` constructor to centralize environment variable handling:

```ts
const config = new ConfigBuilder({
  validate: (finalConfig) => finalConfig,
  runtimeEnv: import.meta.env, // ... to here
})
  .addSource(new EnvironmentVariableSource())
  .build();
```

This change ensures a single, consistent strategy for managing environment variables within the `ConfigBuilder`.
