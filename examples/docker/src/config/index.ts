import { ConfigBuilder } from "@layerfig/config";
import { configSchema } from "./schema";

export const config = new ConfigBuilder(configSchema)
	.addSource("base.json")
	.addSource("prod.json")
	.build();
