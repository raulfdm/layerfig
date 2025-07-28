import { ConfigBuilder, FileSource } from "@layerfig/config";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.build();
