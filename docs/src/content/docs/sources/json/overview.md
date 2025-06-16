---
title: JSON-like
description: This is a page in my Starlight-powered site
---

To overcome JSON's limitations (e.g., lack of comments), the library supports `.json`, `.jsonc`, and `.json5` formats.

```ts
const config = new ConfigBuilder(AppConfigSchema)
  .addSource("base.json")
  .addSource("local.jsonc")
  .addSource("test.json5")
  .build();
```
