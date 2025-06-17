---
title: Schema
description: This is a page in my Starlight-powered site
---

When invoking `ConfigBuilder`, you must provide a schema. A schema, defined using `zod`, ensures that the final configuration object is both type-safe and validated at runtime.

```ts
import { z } from "zod";
import { ConfigBuilder } from "app-config";

export const schema = z.object({
  appURL: z.string(),
  port: z.number(),
});

const config = new ConfigBuilder(schema);
```
