import { ConfigBuilder } from "@layerfig/config";
import { configSchema } from "./schema";

export const config = new ConfigBuilder({
  validate: finalConfig => configSchema.parse(finalConfig)
})
	.addSource("base.json")
	.build();
