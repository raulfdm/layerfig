---
"@layerfig/config": minor
---

feat(slots): Introduce extended slot syntax with fallback support

This change introduces a powerful new syntax for variable substitution, allowing for multiple environment variable fallbacks and an explicit literal fallback value. This provides greater flexibility for configuration.

The original simple slot syntax (e.g., `$VAR`) remains fully supported for backward compatibility.

### New Features

- **Chained Variable Fallbacks:** Provide a list of environment variables to check in order. The first one found is used. If none are defined, the original slot string is retained.
  - **Syntax:** `${VAR1:VAR2:VAR3}`
  - **Example:** `${GIT_REF:REF}` will resolve to `process.env.GIT_REF` if it exists; otherwise, it will try `process.env.REF`.

- **Explicit Literal Fallback:** Use the `:-` operator to define a default value if no environment variables in the chain are found.
  - **Syntax:** `${VAR1:VAR2:-default_value}`
  - **Example:** `${PORT:APP_PORT:-3000}` will resolve to `3000` if neither `PORT` nor `APP_PORT` is set in the environment.
