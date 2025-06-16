---
title: Schema Generation
description: This is a page in my Starlight-powered site
---

If you're using JSON configuration files, you can leverage the `$schema` declaration to enable type inference for the properties in your config.

### Defining the Schema

First, create a `schema.ts` file. This file must default-export a Zod schema:

```ts
// ./path/to/schema.ts
import { z } from "zod";

export default z.object({
  port: z.number(),
});
```

### Generating the Schema File

Run the CLI and pass the relative path to your schema file:

```bash
pnpm app-config --schema ./path/to/schema.ts
```

> [!IMPORTANT]
> In case you have installed the package using `workspace:*` protocol and are building your app with `--ignore-scripts`, the `app-config` CLI won't work. That's because pnpm will skip the step of putting internal packages in the `node_modules/.bin` folder and the binary won't be there.

### Referencing the Schema in Your JSON Config

After running the command, update your JSON configuration file to reference the generated schema file:

```json
{
  "$schema": "../node_modules/.app-config/schema.json"
}
```

### Watching for Changes

Use the `--watch` flag to update the schema automatically:

```bash
pnpm app-config --schema ./path/to/schema.ts --watch
```

> [!NOTE]
> The CLI dependencies are in `devDependencies`, so they are not installed when using `pnpm install --prod`.
