---
"@layerfig/config": minor
---

Expanded the `slot` feature to support environment variables.

You can now use environment variables with slots. For example, given the following setup:

```ts
const config = new ConfigBuilder({
  validate: (finalConfig, z) => {
    const schema = z.object({
      appURL: z.url(),
      port: z.coerce.number().int().positive(),
    });

    return schema.parse(finalConfig);
  },
})
  .addSource(ConfigBuilder.envVarSource())
  .build();
```

When running your application with the following command:

```bash
PORT=3000 HOST=localhost APP_port=$PORT APP_appURL=http://$HOST:$PORT npm run dev
```

The `config` object will be parsed as:

```ts
const config = {
  appURL: "http://localhost:3000",
  port: 3000,
};
```
