---
"@layerfig/config": patch
---

Fix zod types.

`z` on validate were being inferred as `any` and it shouldn't be the case.
