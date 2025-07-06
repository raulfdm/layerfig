import { ConfigBuilder } from "@layerfig/config";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(ConfigBuilder.fileSource("base.json"))
	.addSource(ConfigBuilder.fileSource("prod.json"))
	.build();
