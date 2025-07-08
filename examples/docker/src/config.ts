import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.addSource(new FileSource("prod.json"))
	.build();
