import { z } from "zod/v4";

const configSchema = z.object({
	api: z.object({
		url: z.url(),
	}),
});

export default configSchema;
