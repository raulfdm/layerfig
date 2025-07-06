---
"@layerfig/config": major
---

BREAKING CHANGE:

## .addSource(<file-name>)

The API for loading a file source has changed. Instead of passing a string, you now pass `ConfigBuilder.fileSource(<file-name>)`:

```diff
const config = new ConfigBuilder({
	validate: (finalConfig) => finalConfig,
})
-.addSource("config.json")
+.addSource(ConfigBuilder.fileSource("config.json"))
.build()
```

Under the hood, both the environment source and the file source now extend from a base class. This greatly eases maintenance and the implementation of possible extensions.

## Rename `ConfigBuilder.createEnvVarSource` to `ConfigBuilder.envVarSource`

The name was changed to align with the pattern used for `.fileSource`:

```diff
const config = new ConfigBuilder({
	validate: (finalConfig) => finalConfig,
})
-.addSource(ConfigBuilder.createEnvVarSource(options))
+.addSource(ConfigBuilder.envVarSource(options))
.build()
```

## `ConfigBuilder.envVarSource` no longer accepts `runtimeEnv`

Previously, you could pass a runtime environment:

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

This option has been moved to the `ConfigBuilder` constructor:

```ts
const config = new ConfigBuilder({
  validate: (finalConfig) => finalConfig,
  runtimeEnv: import.meta.env, // ... to here
})
  .addSource(ConfigBuilder.envVarSource())
  .build();
```

This change aligns the internal usage of `process.env` within `ConfigBuilder` into a single strategy.
