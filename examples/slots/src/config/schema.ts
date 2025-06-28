import { z } from "zod";

export const configSchema = z.object({
	baseURL: z.string().url(),
	port: z.coerce.number().int().positive(),
	appEnv: z.enum(['local','dev', 'prod'])
});
