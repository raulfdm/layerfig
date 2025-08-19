---
"@layerfig/config": patch
---

Refactor zod imports to use the official `zod` and `zod/mini` packages instead of local re-exports.

This will fix types not being resolved properly.


