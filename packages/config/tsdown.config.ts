import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "./src/index.ts",
		"sources/env/index": "./src/sources/env-var.ts",
		"sources/file/index": "./src/sources/file.ts",
		"sources/object/index": "./src/sources/object.ts",
	},
	dts: true,
	sourcemap: true,
	format: ["cjs", "esm"],
});
