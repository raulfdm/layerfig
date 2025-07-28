import { ConfigBuilder, FileSource, z } from "@layerfig/config";

const AppEnv = z.enum(["local", "prod"]);

const env = AppEnv.parse(process.env.APP_ENV);

export const config = new ConfigBuilder({
	validate: (finalConfig, z) => {
		const configSchema = z.object({
			appURL: z.url(),
		});

		return configSchema.parse(finalConfig);
	},
})
	.addSource(new FileSource("base.json"))
	.addSource(new FileSource(`${env}.json`))
	.build();
