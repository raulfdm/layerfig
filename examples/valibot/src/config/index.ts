import { ConfigBuilder } from "@layerfig/config";
import * as v from "valibot";

export const configSchema = v.object({
	appURL: v.pipe(v.string(), v.url()),
});

export const config = new ConfigBuilder({
	validate: (finalConfig) => v.parse(configSchema, finalConfig),
})
	.addSource("base.json")
	.addSource("prod.json")
	.build();
