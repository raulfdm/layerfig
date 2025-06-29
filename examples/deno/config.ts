import { ConfigBuilder } from "npm:@layerfig/config";

export const config = new ConfigBuilder({
  validate: (fullConfig, z) => {
    const schema = z.object({
      port: z.number(),
    });

    return schema.parse(fullConfig);
  },
})
  .addSource("base.json")
  .addSource("live.json")
  .build();
