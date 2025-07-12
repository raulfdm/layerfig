import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
import { EnvironmentVariableSource } from "@layerfig/config/sources/env";
import { ConfigSchema } from "./schema";

export const serverConfig = new ConfigBuilder({
  validate: (finalConfig) => ConfigSchema.parse(finalConfig),
})
  .addSource(new FileSource("base.json"))
  .addSource(new EnvironmentVariableSource())
  .build();
