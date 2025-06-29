---
"@layerfig/config": major
---

## `validate` function

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
