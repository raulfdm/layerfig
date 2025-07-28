import { ConfigBuilder, FileSource } from "@layerfig/config";
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
	.build();
