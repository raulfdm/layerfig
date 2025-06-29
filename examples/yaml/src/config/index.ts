import { ConfigBuilder } from "@layerfig/config";
import yamlParser from "@layerfig/parser-yaml";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
	parser: yamlParser,
})
	.addSource("base.yaml")
	.addSource("prod.yaml")
	.build();
