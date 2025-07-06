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
	.addSource(ConfigBuilder.fileSource("base.yaml"))
	.addSource(ConfigBuilder.fileSource("prod.yaml"))
	.build();
