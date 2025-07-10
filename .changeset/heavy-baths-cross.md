---
"@layerfig/config": minor
---

Adds the `ObjectSource`. This new source enables the use of Layerfig on the client-side. It also facilitates debugging and testing by allowing configuration to be passed in directly, eliminating the need to modify configuration files.

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
  runtimeEnv: import.meta.env
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