import { z } from "zod";

const configSchema = z.object({
	api: z.object({
		url: z.url(),
	}),
});

export default configSchema;
