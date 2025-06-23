---
"@layerfig/config": minor
---

remove zod from `peerDependency`.

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
