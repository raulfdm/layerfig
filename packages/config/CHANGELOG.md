# @layerfig/config

## 2.2.0

### Minor Changes

- 0430129: feat(slots): Introduce extended slot syntax with fallback support

  This change introduces a powerful new syntax for variable substitution, allowing for multiple environment variable fallbacks and an explicit literal fallback value. This provides greater flexibility for configuration.

  The original simple slot syntax (e.g., `$VAR`) remains fully supported for backward compatibility.

  ### New Features

  - **Chained Variable Fallbacks:** Provide a list of environment variables to check in order. The first one found is used. If none are defined, the original slot string is retained.

    - **Syntax:** `${VAR1:VAR2:VAR3}`
    - **Example:** `${GIT_REF:REF}` will resolve to `process.env.GIT_REF` if it exists; otherwise, it will try `process.env.REF`.

  - **Explicit Literal Fallback:** Use the `:-` operator to define a default value if no environment variables in the chain are found.
    - **Syntax:** `${VAR1:VAR2:-default_value}`
    - **Example:** `${PORT:APP_PORT:-3000}` will resolve to `3000` if neither `PORT` nor `APP_PORT` is set in the environment.

## 2.1.0

### Minor Changes

- 0eadb6e: Enhanced ObjectSource type inference and flexibility

  Improved `ObjectSource` constructor to support both automatic type inference from literal objects and flexible input when explicitly specifying types. This enhancement addresses the challenge of using schema-derived types with environment variables and slots.

  **Key improvements:**

  - **Automatic type inference**: When passing a literal object, TypeScript now correctly infers the exact type
  - **Flexible input for schemas**: When explicitly specifying a type (e.g., from Zod schemas), the constructor accepts strings, environment variables, and slots where the schema expects specific types
  - **Backward compatibility**: Existing code continues to work without changes

  **Examples:**

  ```ts
  // Automatic type inference from literal object
  const config = new ObjectSource({
    port: 3000,
    host: "localhost",
  }); // Type is automatically inferred

  // Flexible input with explicit schema type
  const schema = z.object({
    port: z.coerce.number(),
    host: z.string(),
  });

  type Schema = z.infer<typeof schema>;

  const envSource = new ObjectSource<Schema>({
    port: "$PORT", // String accepted even though schema expects number
    host: "$HOST", // Environment variables and slots work seamlessly
  });
  ```

## 2.0.0

### Major Changes

- 2d846ce: BREAKING CHANGE:

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

### Minor Changes

- 2d846ce: Log if slot was defined but no env var with the slot name was found.

  This intend to help developers easily understand if an environment variable is missing.

- 2d846ce: Expanded the `slot` feature to support environment variables.

  You can now use environment variables with slots. For example, given the following setup:

  ```ts
  import { ConfigBuilder } from "@layerfig/config";
  import { EnvironmentVariableSource } from "@layerfig/config/sources/env";

  const config = new ConfigBuilder({
    validate: (finalConfig, z) => {
      const schema = z.object({
        appURL: z.url(),
        port: z.coerce.number().int().positive(),
      });

      return schema.parse(finalConfig);
    },
  })
    .addSource(new EnvironmentVariableSource())
    .build();
  ```

  When running your application with the following command:

  ```bash
  PORT=3000 HOST=localhost APP_port=$PORT APP_appURL=http://$HOST:$PORT npm run dev
  ```

  The `config` object will be parsed as:

  ```ts
  const config = {
    appURL: "http://localhost:3000",
    port: 3000,
  };
  ```

- 2d846ce: remove support for node 10 imports
- 2d846ce: Adds the `ObjectSource`. This new source enables the use of Layerfig on the client-side. It also facilitates debugging and testing by allowing configuration to be passed in directly, eliminating the need to modify configuration files.

  ```ts
  import { ConfigBuilder, z } from "@layerfig/config";
  import { ObjectSource } from "@layerfig/config/sources/object";

  const ConfigSchema = z.object({
    appURL: z.url(),
    api: z.object({
      port: z.coerce.number().int().positive(),
    }),
  });

  const config = new ConfigBuilder({
    validate: (finalConfig) => ConfigSchema.parse(finalConfig),
    runtimeEnv: import.meta.env,
  })
    .addSource(
      new ObjectSource({
        appURL: "$PUBLIC_APP_URL",
        api: {
          port: "$PORT",
        },
      })
    )
    .build();
  ```

## 2.0.0-next.4

### Minor Changes

- 59a8819: remove support for node 10 imports
- 28b5078: Adds the `ObjectSource`. This new source enables the use of Layerfig on the client-side. It also facilitates debugging and testing by allowing configuration to be passed in directly, eliminating the need to modify configuration files.

  ```ts
  import { ConfigBuilder, z } from "@layerfig/config";
  import { ObjectSource } from "@layerfig/config/sources/object";

  const ConfigSchema = z.object({
    appURL: z.url(),
    api: z.object({
      port: z.coerce.number().int().positive(),
    }),
  });

  const config = new ConfigBuilder({
    validate: (finalConfig) => ConfigSchema.parse(finalConfig),
    runtimeEnv: import.meta.env,
  })
    .addSource(
      new ObjectSource({
        appURL: "$PUBLIC_APP_URL",
        api: {
          port: "$PORT",
        },
      })
    )
    .build();
  ```

## 2.0.0-next.3

### Major Changes

- 777ffea: BREAKING CHANGE:

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

## 2.0.0-next.2

### Minor Changes

- e1a15a4: Log if slot was defined but no env var with the slot name was found.

  This intend to help developers easily understand if an environment variable is missing.

## 2.0.0-next.1

### Minor Changes

- 6a56beb: Expanded the `slot` feature to support environment variables.

  You can now use environment variables with slots. For example, given the following setup:

  ```ts
  const config = new ConfigBuilder({
    validate: (finalConfig, z) => {
      const schema = z.object({
        appURL: z.url(),
        port: z.coerce.number().int().positive(),
      });

      return schema.parse(finalConfig);
    },
  })
    .addSource(ConfigBuilder.envVarSource())
    .build();
  ```

  When running your application with the following command:

  ```bash
  PORT=3000 HOST=localhost APP_port=$PORT APP_appURL=http://$HOST:$PORT npm run dev
  ```

  The `config` object will be parsed as:

  ```ts
  const config = {
    appURL: "http://localhost:3000",
    port: 3000,
  };
  ```

## 2.0.0-next.0

### Major Changes

- b4c3eb5: BREAKING CHANGE:

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

## 1.0.0

### Major Changes

- 522badb: ## `validate` function

  The `validate` function signature has been changed to include a `zod` instance as the second argument. This removes the need to install `zod` as a separate dependency.

  Before:

  ```bash
  npm install @layerfig/config zod
  ```

  ```ts
  // ./path/to/config.ts
  import { ConfigBuilder } from "@layerfig/config";
  import { z } from "zod/v4";

  const schema = z.object({
    appURL: z.url(),
  });

  const config = new ConfigBuilder({
    validate: (finalConfig) => schema.parse(finalConfig),
  })
    .addSource("base.json")
    .build();
  ```

  After:

  ```bash
  npm install @layerfig/config
  ```

  ```ts
  // ./path/to/config.ts
  import { ConfigBuilder } from "@layerfig/config";

  const config = new ConfigBuilder({
    validate: (finalConfig, z) => {
      const schema = z.object({
        appURL: z.url(),
      });

      return schema.parse(finalConfig);
    },
  })
    .addSource("base.json")
    .build();
  ```

  ## `zod` export

  In addition to being accessible in the `validate` function, `zod` is now exported directly from `@layerfig/config`. This allows you to define your schema in a separate file.

  ```ts
  // ./path/to/config/schema.ts
  import { z } from "@layerfig/config";

  export const schema = z.object({
    appURL: z.url(),
  });

  // ...then...
  // ./path/to/config/index.ts
  import { ConfigBuilder } from "@layerfig/config";
  import { schema } from "./path/to/config/schema";

  const config = new ConfigBuilder({
    validate: (finalConfig) => schema.parse(finalConfig),
  })
    .addSource("base.json")
    .build();
  ```

## 0.4.0

### Minor Changes

- 5d96393: Add `slots` feature.

  Now you can use slots to use environment variable values values:

  `.env` or similar:

  ```env
  PORT=3000
  ```

  Your config file:

  ```json
  {
    "port": "$PORT"
  }
  ```

  In your validate function, you'll receive:

  ```json
  {
    "port": "3000"
  }
  ```

  > [Read more about slots](https://layerfig.dev/introduction/setup/slots/)

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
