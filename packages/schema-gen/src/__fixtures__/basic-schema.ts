import { z } from "zod";

const configSchema = z.object({
	api: z.object({
		url: z.string().url(),
	}),
});

export default configSchema;
