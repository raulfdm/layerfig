---
"@layerfig/config": minor
---

Feature: Client submodule

To improve separation of concerns and prevent accidental use of server-only APIs, a new submodule is now available for client-side configuration: `@layerfig/config/client`.

This module is built for the browser and omits all file-system, folder, and parser-related options.

It exports everything you need:

```ts
import { ConfigBuilder, ObjectSource } from "@layerfig/config/client";

const config = new ConfigBuilder({
  validate: (finalConfig, z) =>
    z
      .object({
        baseURL: z.url(),
      })
      .parse(finalConfig),

  runtimeEnv: import.meta.env,
})
  .addSource(
    new ObjectSource({
      baseURL: "$BASE_URL",
    })
  )
  .build();
```

> It also exports `z` (zod 4 mini) in case you want to separate your schema.