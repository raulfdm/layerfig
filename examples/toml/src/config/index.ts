import { ConfigBuilder } from "@layerfig/config";
import tomlParser from '@layerfig/parser-toml'
import { configSchema } from "./schema";


export const config = new ConfigBuilder({
  validate: finalConfig => configSchema.parse(finalConfig),
  parser: tomlParser
})
	.addSource("base.toml")
	.addSource("local.toml")
	.addSource("prod.toml")
	.build();
