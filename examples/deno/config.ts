import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";

export const config = new ConfigBuilder({
  validate: (fullConfig, z) => {
    const schema = z.object({
      port: z.number(),
    });

    return schema.parse(fullConfig);
  },
})
  .addSource(new FileSource("base.json"))
  .addSource(new FileSource("live.json"))
  .build();
