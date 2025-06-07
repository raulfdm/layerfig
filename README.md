# `app-config`

## Description

This library provides a simple way to implement configuration layering. It allows you to define multiple configuration sources, which are then merged into a single, type-safe configuration object.

## How It Works

When you invoke `AppConfigBuilder`, you can access your environment's configuration from two primary sources:

1. **File-based** – Define your configuration in JSON/JSON5 or YAML files.
2. **Environment variables** – Override configurations dynamically. This is useful for pre-built containers that require specific values at runtime.

Since the configuration follows a cascading approach, the final result depends on the order in which sources are added.

```ts
export const config = new AppConfigBuilder(schema) // 0. Starts empty
  .addSource("base.jsonc") // 1. Adds everything from `base.jsonc`
  .addSource("live.jsonc") // 2. Merges with `base.jsonc`
  .addSource(AppConfigBuilder.createEnvVarSource()) // 3. Allows environment variables to overwrite previous values
  .build(); // 4. Validates using the schema and returns the final configuration
```

## Installation

```bash
pnpm add app-config zod
```

## Usage

Given the following configuration files:

```
app/
└─ config/
   ├─ base.jsonc
   └─ live.jsonc
```

**Example: `base.jsonc`**

```jsonc
// ./app/config/base.jsonc
{
  "appURL": "http://localhost:3000",
  "port": 3000
}
```

**Example: `live.jsonc`**

```jsonc
// ./app/config/live.jsonc
{
  "appURL": "https://live.my-app.company"
}
```

To define your application configuration:

```tsx
// ./path/to/config.ts
import { AppConfigBuilder } from "app-config";
import { schema } from "./schema";

export const config = new AppConfigBuilder(schema)
  .addSource("base.jsonc")
  .addSource("live.jsonc")
  .build();
```

Now, you can access the configuration anywhere in your server-side code:

```ts
import { config } from "./path/to/config.ts";

config.appURL; // string => "https://live.my-app.company"
config.port; // number => 3000
```

## Configuration

### `schema`

When invoking `AppConfigBuilder`, you must provide a schema. A schema, defined using `zod`, ensures that the final configuration object is both type-safe and validated at runtime.

```ts
import { z } from "zod";
import { AppConfigBuilder } from "app-config";

export const schema = z.object({
  appURL: z.string(),
  port: z.number(),
});

const config = new AppConfigBuilder(schema);
```

### `configFolder`

By default, when using `addSource` for file-based configurations, the library expects a `config` folder in the project's root. However, you can customize this path:

```ts
const config = new AppConfigBuilder(AppConfigSchema, {
  configFolder: "./path/to/config-folder",
})
  .addSource("base.yaml")
  .build();
```

In this case, the library will look for `<root>/path/to/config-folder/base.yaml` and load it.

## Sources

A **source** is where configuration values are loaded from. The library supports `JSON`, `YAML`, and `environment variables` (details below). You can specify sources using `addSource`.

> [!TIP]
> Multiple sources can be loaded at once, allowing for flexible configuration setups.

### JSON

To overcome JSON's limitations (e.g., lack of comments), the library supports `.json`, `.jsonc`, and `.json5` formats.

```ts
const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.json")
  .addSource("local.jsonc")
  .addSource("test.json5")
  .build();
```

### YAML

Both `.yaml` and `.yml` file extensions are supported.

```ts
const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.yml")
  .addSource("local.yaml")
  .build();
```

## Configuration Overrides via Environment Variables

Imagine this scenario:  
Your application has its configuration files committed, and you've built a Docker image for production. You need to run the image locally to debug or test a specific behavior. However, since the configuration values are hardcoded, modifying them requires rebuilding the image.

This process can be cumbersome, especially if your application is large and takes time to build. Additionally, you're not testing the exact image intended for production but a modified version.

To solve this, you can use `AppConfigBuilder.createEnvVarSource()` to dynamically override configurations without modifying the files.

```ts
import { AppConfigBuilder } from "app-config";

const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.yaml")
  .addSource(AppConfigBuilder.createEnvVarSource())
  .build();
```

By default, the library looks for environment variables with:

- **Prefix:** `"APP"`
- **Prefix separator:** `"_"`

This means it recognizes environment variables starting with `APP_` (e.g., `APP_port`).

> [!IMPORTANT]
> Configuration keys in environment variables must match the keys in your schema.

### Example Usage

To override values via environment variables:

```yaml
appURL: http://localhost:4444
port: 4444
```

```ts
const AppConfigSchema = z.object({
  appURL: z.string(),
  port: z.number(),
});

const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.yaml")
  .addSource(AppConfigBuilder.createEnvVarSource())
  .build();
```

```bash
APP_appURL=http://localhost:4444 APP_port=4444 node index.js
```

Since `AppConfigBuilder.createEnvVarSource` is the last loaded source, the configuration values will be the ones defined via environment variables.

### Overriding Nested Objects

For nested configurations, the default **separator** is `__` (double underscore). This allows for deep overrides:

```ts
const AppConfigSchema = z.object({
  api: z.object({
    vendor: z.object({
      aws: z.object({
        apiToken: z.string(),
      }),
    }),
  }),
});

const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.yaml")
  .addSource(AppConfigBuilder.createEnvVarSource())
  .build();
```

```bash
APP_api__vendor__aws__apiToken=12345 node index.js
```

### Customizing Environment Variable Settings

You can modify the prefix, prefix separator, and nested key separator as needed:

```ts
const AppConfigSchema = z.object({
  api: z.object({
    vendor: z.object({
      aws: z.object({
        apiToken: z.string(),
      }),
    }),
  }),
});

const config = new AppConfigBuilder(AppConfigSchema)
  .addSource("base.yaml")
  .addSource(
    AppConfigBuilder.createEnvVarSource({
      prefix: "VULCAN",
      prefixSeparator: "--",
      separator: "----",
    })
  )
  .build();
```

```bash
VULCAN--api----vendor----aws----apiToken=12345 node index.js
```

## Typed JSON Config

If you're using JSON configuration files, you can leverage the `$schema` declaration to enable type inference for the properties in your config.

### Defining the Schema

First, create a `schema.ts` file. This file must default-export a Zod schema:

```ts
// ./path/to/schema.ts
import { z } from "zod";

export default z.object({
  port: z.number(),
});
```

### Generating the Schema File

Run the CLI and pass the relative path to your schema file:

```bash
pnpm app-config --schema ./path/to/schema.ts
```

> [!IMPORTANT]
> In case you have installed the package using `workspace:*` protocol and are building your app with `--ignore-scripts`, the `app-config` CLI won't work. That's because pnpm will skip the step of putting internal packages in the `node_modules/.bin` folder and the binary won't be there.

### Referencing the Schema in Your JSON Config

After running the command, update your JSON configuration file to reference the generated schema file:

```json
{
  "$schema": "../node_modules/.app-config/schema.json"
}
```

### Watching for Changes

Use the `--watch` flag to update the schema automatically:

```bash
pnpm app-config --schema ./path/to/schema.ts --watch
```

> [!NOTE]
> The CLI dependencies are in `devDependencies`, so they are not installed when using `pnpm install --prod`.
