import { ConfigBuilder, FileSource } from "@layerfig/config";
import yamlParser from "@layerfig/parser-yaml";

export const config = new ConfigBuilder({
  validate: (finalConfig, z) => {
    const configSchema = z.object({
      appURL: z.url(),
    });

    return configSchema.parse(finalConfig);
  },
  parser: yamlParser,
})
  .addSource(new FileSource("base.yaml"))
  .addSource(new FileSource("prod.yaml"))
  .build();
