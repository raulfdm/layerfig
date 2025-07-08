import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			baseURL: z.url(),
			port: z.coerce.number().int().positive(),
			appEnv: z.enum(["local", "dev", "prod"]),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.build();
