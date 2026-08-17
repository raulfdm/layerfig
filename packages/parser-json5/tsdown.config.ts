import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts"],
	dts: true,
	format: ["cjs", "esm"],
	// tsdown >=0.16 defaults `fixedExtension` to true on the node platform,
	// which would rename dist output to .mjs/.d.mts. Keep the published filenames.
	fixedExtension: false,
	// attw: true, // This is freezing the build
});
