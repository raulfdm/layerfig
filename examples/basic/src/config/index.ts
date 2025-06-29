import { ConfigBuilder } from "@layerfig/config";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const schema = z.object({
			appURL: z.url(),
		});

		return schema.parse(finalConfig);
	},
})
	.addSource("base.json")
	.addSource("prod.json")
	.build();
