import {
  ConfigBuilder,
  EnvironmentVariableSource,
  FileSource,
} from "@layerfig/config";
import { ConfigSchema } from "./schema";

export const serverConfig = new ConfigBuilder({
  validate: (finalConfig) => ConfigSchema.parse(finalConfig),
})
  .addSource(new FileSource("base.json"))
  .addSource(new EnvironmentVariableSource())
  .build();
