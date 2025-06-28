---
"@layerfig/config": minor
---

Add `slots` feature.

Now you can use slots to use environment variable values values:

`.env` or similar:

```env
PORT=3000
```

Your config file:
```json
{
  "port": "$PORT"
}
```

In your validate function, you'll receive:

```json
{
  "port": "3000"
}
```

> [Read more about slots](https://layerfig.raulmelo.workers.dev/introduction/setup/slots/)
