import { z } from "zod/v4";

export const configSchema = z.object({
	appURL: z.url(),
	port: z.number()
});

export default configSchema
