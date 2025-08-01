---
"@layerfig/config": minor
---

Adds self-referencing slots to Layerfig. Now you can reference other values within the same configuration file using the `${self.path.to.value}` syntax. This helps to reduce duplication and improve consistency in your configuration.

For example:

```json
{
  "port": "${PORT:-3000}",
  "appURL": "http://localhost:${self.port}"
}
```

In this case, `appURL` will resolve to `http://localhost:3000` by referencing the `port` value from the same configuration object.
