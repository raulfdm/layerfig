import { z } from "@layerfig/config";

export const ConfigSchema = z.object({
  port: z.coerce.number().default(3000),
  env: z.enum(["local"]),
});
