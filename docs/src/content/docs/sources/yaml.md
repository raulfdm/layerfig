---
title: YAML
description: This is a page in my Starlight-powered site
---

Both `.yaml` and `.yml` file extensions are supported.

```ts
const config = new ConfigBuilder(AppConfigSchema)
  .addSource("base.yml")
  .addSource("local.yaml")
  .build();
```
