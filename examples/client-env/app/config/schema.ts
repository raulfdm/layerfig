import { z } from "@layerfig/config/zod";

export const ConfigSchema = z.object({
  port: z.coerce.number(),
  env: z.enum(["local"]),
});
