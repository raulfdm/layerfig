---
"@layerfig/config": patch
---

Accept more primitive types for `runtimeEnv`.

While `process.env` gives a record like `Record<string, string|undefined>`, `import.meta.env` can provide other values such as boolean, numbers, etc.
