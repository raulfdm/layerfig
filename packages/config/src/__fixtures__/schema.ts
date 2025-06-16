import { z } from "zod/v4";

export default z.object({
	name: z.string(),
	version: z.number(),
	description: z.string(),
});
