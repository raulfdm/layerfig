import { ConfigBuilder, FileSource, z } from "@layerfig/config";

// Define tenant types
const acmeTenantId = "acme" as const;
const betaTenantId = "beta" as const;
export const availableTenants = [acmeTenantId, betaTenantId] as const;
export const Tenants = z.enum(availableTenants);
export type TenantId = typeof availableTenants[number];

// Base configuration schema
const BaseAppConfig = z.object({
  port: z.number(),
});

const CommonTenantConfig = BaseAppConfig.extend(
  z.object({
    name: z.string(),
    subdomain: z.string(),
  }).shape,
);

// Tenant-specific extensions
const AcmeExtension = z.object({
  ssoProvider: z.enum(["google", "github"]),
});

const BetaExtension = z.object({
  webhooks: z.array(z.string()),
});

// Combined tenant configurations
const AcmeConfig = CommonTenantConfig.extend({
  ...AcmeExtension.shape,
  id: z.literal(acmeTenantId),
});
const BetaConfig = CommonTenantConfig.extend({
  ...BetaExtension.shape,
  id: z.literal(betaTenantId),
});

// Type mapping for tenant configurations
export type TenantConfigType<T extends TenantId> = T extends "acme"
  ? z.infer<typeof AcmeConfig>
  : T extends "beta" ? z.infer<typeof BetaConfig>
  : never;

// Configuration mapping
const configMap = {
  acme: AcmeConfig,
  beta: BetaConfig,
} as const;

// Storage for loaded configurations
const tenantConfigs = new Map<TenantId, unknown>();

/**
 * Retrieves and caches tenant configuration
 */
export function getTenantConfig<T extends TenantId>(
  tenant: T,
): TenantConfigType<T> {
  // Validate tenant input
  const parsedTenant = Tenants.parse(tenant);

  // Return cached config if available
  if (tenantConfigs.has(parsedTenant)) {
    return tenantConfigs.get(parsedTenant) as TenantConfigType<T>;
  }

  // Get appropriate schema
  const schema = configMap[parsedTenant];

  // Build new configuration
  const config = new ConfigBuilder({
    validate: (finalConfig) => schema.parse(finalConfig),
  })
    .addSource(new FileSource(`base.${parsedTenant}.json`))
    .addSource(new FileSource("base.json"))
    .build();

  // Cache and return
  tenantConfigs.set(parsedTenant, config);

  return config as TenantConfigType<T>;
}

export const baseAppConfig = new ConfigBuilder({
  validate: (finalConfig) => BaseAppConfig.parse(finalConfig),
}).addSource(new FileSource("base.json")).build();
