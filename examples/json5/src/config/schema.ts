import { z } from "zod";

export const configSchema = z.object({
	appURL: z.string().url(),
});
