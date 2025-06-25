import { ConfigBuilder } from "@layerfig/config";
import yamlParser from '@layerfig/parser-json5'
import { configSchema } from "./schema";

if(!process.env.APP_ENV){
  throw new Error('APP_ENV environment variable is not set');
}

export const config = new ConfigBuilder({
  validate: finalConfig => configSchema.parse(finalConfig),
  parser: yamlParser
})
	.addSource("base.json")
	.addSource(`${process.env.APP_ENV}.json`)
	.build();
