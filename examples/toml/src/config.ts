import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";
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
	.addSource(new FileSource("base.toml"))
	.addSource(new FileSource("local.toml"))
	.addSource(new FileSource("prod.toml"))
	.build();
