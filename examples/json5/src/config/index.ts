import { ConfigBuilder } from "@layerfig/config";
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
	.addSource("base.jsonc")
	.addSource("local.json")
	.addSource("prod.json5")
	.build();
