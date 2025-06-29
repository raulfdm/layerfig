import { ConfigBuilder } from "@layerfig/config";
import { z } from "zod/v4";

const tenants = z.enum(["acme", "beta"]);

const TenantConfig = z.object({
  name: z.string(),
  subdomain: z.string(),
  id: tenants,
});
export type TenantConfig = z.infer<typeof TenantConfig>;

const schema = z.object({
  port: z.number(),
  tenants: z.record(tenants, TenantConfig),
});

export const config = new ConfigBuilder({
  validate: (finalConfig) => schema.parse(finalConfig),
}).addSource("base.json").build();
