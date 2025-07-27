---
"@layerfig/config": major
---

BREAKING CHANGE: upgrade zod dependency to v4 and ship the `mini` version.

### Details

We give access to `z` (zod) to users so they don't need to bring a schema validator only for setting the configuration.

```ts
export const config = new ConfigBuilder({
  validate: (finalConfig, z) =>
    z.object({
        appURL: z.url(),
        port: z.coerce.number().int().int().positive(),
      })
      .parse(finalConfig),
})
  .addSource(new FileSource("base.json"))
  .build();
```

The problem is that we provided the "big" version of zod which can go from 5.91kb to 13.1kb (gzip), which if you're using only for server it's fine but if you're using the client approach it'll be a huge bundle.

Now, `z` is no longer regular zod but the [`mini`](https://zod.dev/packages/mini) version of it, which changes how to define the schema:

```diff
-z.string().optional().default("APP")
+z._default(z.optional(z.string()), "APP")


-schema.partial()
+z.partial(schema)

-z.coerce.number().int().positive()
+z.coerce.number().check(z.int(), z.positive()),
```

Also, before you could import `z` from the main entrypoint:

```ts
import { z } from "@layerfig/config"
```

Now we provide two other sub-modules: `zod` and `zod-mini`

```ts
// full zod 4
import { z } from "@layerfig/config/zod"

// zod 4 mini
import { z } from "@layerfig/config/zod-mini"
```