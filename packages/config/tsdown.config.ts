import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: { zod: "./src/zod.ts", "zod-mini": "./src/zod-mini.ts" },
		dts: true,
		format: ["cjs", "esm"],
		platform: "neutral",
		sourcemap: true,
	},
	{
		entry: "./src/server/index.ts",
		dts: true,
		format: ["cjs", "esm"],
		platform: "node",
		// tsdown >=0.16 defaults `fixedExtension` to true on the node platform,
		// which would rename dist output to .mjs/.d.mts. Keep the published filenames.
		fixedExtension: false,
		sourcemap: true,
	},
	{
		entry: {
			client: "./src/client/index.ts",
		},
		dts: true,
		format: ["esm"],
		platform: "browser",
		sourcemap: true,
	},
]);
