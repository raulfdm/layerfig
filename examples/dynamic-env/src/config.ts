import { ConfigBuilder } from "@layerfig/config";
import { FileSource } from "@layerfig/config/sources/file";

if (!process.env.APP_ENV) {
	throw new Error("APP_ENV environment variable is not set");
}

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.addSource(new FileSource(`${process.env.APP_ENV}.json`))
	.build();
