import { ConfigBuilder } from "@layerfig/config";
import tomlParser from "@layerfig/parser-toml";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
	parser: tomlParser,
})
	.addSource(ConfigBuilder.fileSource("base.toml"))
	.addSource(ConfigBuilder.fileSource("local.toml"))
	.addSource(ConfigBuilder.fileSource("prod.toml"))
	.build();
