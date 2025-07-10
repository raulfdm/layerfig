import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const schema = z.object({
			appURL: z.url(),
		});

		return schema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.addSource(new FileSource("prod.json"))
	.build();
