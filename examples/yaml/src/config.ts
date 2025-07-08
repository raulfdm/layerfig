import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
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
	.addSource(new FileSource("base.yaml"))
	.addSource(new FileSource("prod.yaml"))
	.build();
