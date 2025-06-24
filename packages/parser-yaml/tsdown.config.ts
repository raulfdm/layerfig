import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts"],
	dts: true,
	format: ["cjs", "esm"],
	// attw: true, // This is freezing the build
});
