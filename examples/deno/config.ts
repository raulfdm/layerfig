import { ConfigBuilder } from "@layerfig/config";

export const config = new ConfigBuilder({
  validate: (fullConfig, z) => {
    const schema = z.object({
      port: z.number(),
    });

    return schema.parse(fullConfig);
  },
})
  .addSource(ConfigBuilder.fileSource("base.json"))
  .addSource(ConfigBuilder.fileSource("live.json"))
  .build();
