import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
import json5Parser from "@layerfig/parser-json5";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
	parser: json5Parser,
})
	.addSource(new FileSource("base.jsonc"))
	.addSource(new FileSource("local.json"))
	.addSource(new FileSource("prod.json5"))
	.build();
