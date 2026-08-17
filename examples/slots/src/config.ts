import { ConfigBuilder, FileSource } from "@layerfig/config";

const env = process.env.NODE_ENV === "production" ? "production" : "development";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => {
    const configSchema = z.object({
      baseURL: z.url(),
      port: z.coerce.number().int().positive(),
      appVersion: z.string(),
      debugLevel: z.enum(["error", "warn", "info", "debug"]),
      healthCheckURL: z.url(),
    });

    return configSchema.parse(finalConfig);
  },
})
  .addSource(new FileSource("base.json"))
  /**
   * `healthCheckURL` is defined here but it self-references `port`, which only
   * exists in `base.json`. Slots are resolved after all sources are merged, so
   * the reference works across files.
   */
  .addSource(new FileSource(`${env}.json`))
  .build();
