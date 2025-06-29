import { config } from "./config";

export function getTenantSettings(): {
  hostConfig: string;
  url: URL;
  name: string;
}[] {
  return Object.values(config.tenants).map((tenantConfig) => {
    return {
      hostConfig: `127.0.0.1 ${tenantConfig.id}.localhost`,
      url: new URL(`http://${tenantConfig.subdomain}.localhost:${config.port}`),
      name: tenantConfig.name,
    };
  });
}
