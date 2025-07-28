import { ConfigBuilder, FileSource } from "@layerfig/config";

export const config = new ConfigBuilder({
  validate: (fullConfig, z) => {
    const schema = z.object({
      port: z.number(),
      environment: z.string()
    });

    return schema.parse(fullConfig);
  },
})
  .addSource(new FileSource("base.json"))
  .build();
