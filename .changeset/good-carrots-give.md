---
"@layerfig/config": major
---

BREAKING CHANGE: remove `/source/*` submodule.

When first introduced, the `/source/*` submodule prevented accidental imports of server-only APIs when using Layerfig in the browser.

We now ship a dedicated `/client` submodule built for the browser platform, making the separate `/source/*` entry point obsolete.

Because bundle size is irrelevant on the server, you can import everything from the main entry:

```ts
import {
  ConfigBuilder,
  FileSource, // server only
  ObjectSource,
  EnvironmentVariableSource,
  z // zod 4
} from '@layerfig/config'
```

For the client:

```ts
import {
  ConfigBuilder,
  ObjectSource,
  EnvironmentVariableSource,
  z // zod 4 mini
} from '@layerfig/config/client'
```