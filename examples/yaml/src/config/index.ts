import { ConfigBuilder } from "@layerfig/config";
import yamlParser from '@layerfig/parser-yaml'
import { configSchema } from "./schema";


export const config = new ConfigBuilder({
  validate: finalConfig => configSchema.parse(finalConfig),
  parser: yamlParser
})
	.addSource("base.yaml")
	.addSource("prod.yaml")
	.build();
