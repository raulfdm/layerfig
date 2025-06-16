---
title: Config Folder
description: This is a page in my Starlight-powered site
---

By default, when using `addSource` for file-based configurations, the library expects a `config` folder in the project's root. However, you can customize this path:

```ts
const config = new ConfigBuilder(AppConfigSchema, {
  configFolder: "./path/to/config-folder",
})
  .addSource("base.yaml")
  .build();
```

In this case, the library will look for `<root>/path/to/config-folder/base.yaml` and load it.
