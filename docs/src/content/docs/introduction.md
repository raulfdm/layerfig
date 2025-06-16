---
title: Intro
description: This is a page in my Starlight-powered site
---

A simple way to implement configuration layering. It allows you to define multiple configuration sources, which are then merged into a single, type-safe configuration object.

## How It Works

When you invoke `ConfigBuilder`, you can access your environment's configuration from two primary sources:

1. **File-based** – Define your configuration in JSON/JSON5 or YAML files.
2. **Environment variables** – Override configurations dynamically. This is useful for pre-built containers that require specific values at runtime.

Since the configuration follows a cascading approach, the final result depends on the order in which sources are added.

```ts
export const config = new ConfigBuilder(schema) // 0. Starts empty
  .addSource("base.jsonc") // 1. Adds everything from `base.jsonc`
  .addSource("live.jsonc") // 2. Merges with `base.jsonc`
  .addSource(ConfigBuilder.createEnvVarSource()) // 3. Allows environment variables to overwrite previous values
  .build(); // 4. Validates using the schema and returns the final configuration
```
