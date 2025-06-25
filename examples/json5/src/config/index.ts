import { ConfigBuilder } from "@layerfig/config";
import json5Parser from '@layerfig/parser-json5'
import { configSchema } from "./schema";


export const config = new ConfigBuilder({
  validate: finalConfig => configSchema.parse(finalConfig),
  parser: json5Parser
})
	.addSource("base.jsonc")
	.addSource("local.json")
	.addSource("prod.json5")
	.build();
