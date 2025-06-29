import { config } from "./config"

export function getTentantSettings(): {hostConfig: string, url: string,name:string}[] {
  return Object.values(config.tenants).map(tenantConfig => {
    return {
      hostConfig: `127.0.0.1 ${tenantConfig.id}.localhost`,
      url: `http://${tenantConfig.subdomain}.localhost:${config.port}`,
      name: tenantConfig.name
    }
  })
}
