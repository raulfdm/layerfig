import { ConfigBuilder, FileSource } from "@layerfig/config";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => {
    const configSchema = z.object({
      baseURL: z.url(),
      port: z.coerce.number().int().positive(),
      appVersion: z.string(),
      debugLevel: z.enum(["error", "warn", "info", "debug"]),
    });

    return configSchema.parse(finalConfig);
  },
})
  .addSource(new FileSource("base.json"))
  .build();
