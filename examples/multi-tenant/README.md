# Layerfig: Multi Tenant App Example

Building a separate, independently-typed config per tenant, resolved from the
request's subdomain.

## Getting started

> This project uses Bun so it can run TypeScript without a build step. Make sure
> you have Bun 1.2 or higher.

Install dependencies:

```bash
bun install
```

Run the server:

```bash
bun run dev
```

Then open `http://localhost:3000`, which lists the available tenants and prints
the `/etc/hosts` entries you need for the subdomains to resolve locally:

```
127.0.0.1 acme.localhost
127.0.0.1 beta.localhost
```

## What this example shows

Each tenant gets its own base layer — `config/base.acme.json`,
`config/base.beta.json` — merged over the shared `config/base.json`:

```ts
const config = new ConfigBuilder({
  validate: (finalConfig) => schema.parse(finalConfig),
})
  .addSource(new FileSource(`base.${parsedTenant}.json`))
  .addSource(new FileSource("base.json"))
  .build();
```

Tenants don't share a schema. `acme` requires `ssoProvider`, `beta` requires
`webhooks`, and `TenantConfigType<T>` maps a tenant id to the right shape, so
`getTenantConfig("acme").ssoProvider` type-checks while
`getTenantConfig("beta").ssoProvider` does not.

Configs are built lazily on first use and cached in a `Map`, so each tenant's
files are read and validated once per process.

`src/middleware.ts` reads the subdomain off the incoming request and attaches
the matching config, which is how a single server serves every tenant.
