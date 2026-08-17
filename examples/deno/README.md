# Layerfig: Deno Example

Using Layerfig in Deno via the npm compatibility layer.

## Getting started

Install dependencies:

```bash
deno i
```

Run the server:

```bash
deno task dev
```

The server is available at `http://localhost:3000`.

## What this example shows

`@layerfig/config` is a regular npm package, so it is declared in `package.json`
and imported unchanged:

```ts
import { ConfigBuilder, FileSource } from "@layerfig/config";
```

### Permissions

Layerfig reads config files from disk and environment variables (for slots and
`EnvironmentVariableSource`), so the `dev` task grants both:

```jsonc
{
  "tasks": {
    // --allow-read for config/, --allow-env for slot resolution
    "dev": "deno run --allow-read=$PWD --allow-env --allow-net --watch main.ts"
  }
}
```

Without `--allow-env`, the build throws `NotCapable: Requires env access`.
