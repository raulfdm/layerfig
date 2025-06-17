import { z } from "zod";

const configSchema = z.object({
	api: z.object({
		url: z.object({
			port: z.number().default(3000),
			baseURL: z.string(),
		}),
	}),
	featureFlags: z.object({
		isDeployed: z.boolean(),
	}),
});

export default configSchema;
