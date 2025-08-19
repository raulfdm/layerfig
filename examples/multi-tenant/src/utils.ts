import { availableTenants, getTenantConfig } from "./config";

export function getTenantSettings(): {
  hostConfig: string;
  url: URL;
  name: string;
  port: number;
}[] {
  return availableTenants.map((tenant) => {
    const config = getTenantConfig(tenant);

    return {
      hostConfig: `127.0.0.1 ${config.id}.localhost`,
      url: new URL(`http://${config.subdomain}.localhost:${config.port}`),
      name: config.name,
      port: config.port,
    };
  });
}
