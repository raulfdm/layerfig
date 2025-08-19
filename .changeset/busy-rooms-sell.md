---
"@layerfig/config": major
---

BREAKING CHANGE: refactor slot syntax.

### Changes

Simple slots needs to be wrapped by `${}`:

```diff
{
- "port": "$PORT"
+ "port": "${PORT}"
}
```

Slot separator changed from `:` to `::`:

```diff
{
- "port": "${APP_PORT:PORT}"
+ "port": "${APP_PORT::PORT}"
}
```

### Fixes

#### URL case

If a slot contained an URL, it didn't resolve properly the fallback value:

Before:

```
${URL:-http://localhost:3000} => "//localhost:3000"
```

After:

```
${URL::-http://localhost:3000} => "http://localhost:3000"
```

#### Multiple slots

When multiple slots were defined in the same property, the final value didn't get resolved:

Before:

```
${self.hostname:-local}:${PORT:-3000} => "local:${PORT:-3000}"
```

Now:

```
${self.hostname::-local}:${PORT::-3000} => "local:3000"
```