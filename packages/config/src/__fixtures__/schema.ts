import { z } from "zod";

export default z.object({
	name: z.string(),
	version: z.number(),
	description: z.string(),
});
