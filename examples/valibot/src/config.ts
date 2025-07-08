import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
import * as v from "valibot";

export const configSchema = v.object({
	appURL: v.pipe(v.string(), v.url()),
});

export const config = new ConfigBuilder({
	validate: (finalConfig) => v.parse(configSchema, finalConfig),
})
	.addSource(new FileSource("base.json"))
	.addSource(new FileSource("prod.json"))
	.build();
