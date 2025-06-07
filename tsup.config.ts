import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["./src/index.ts", "./src/cli.ts"],
	format: ["esm", "cjs"],
	dts: true,
	tsconfig: "./tsconfig.build.json",
	outDir: "dist",
	clean: true,
	target: "node20",
	external: [
		/**
		 * Zod is listed as devDependency (because it's peerDependency of zod-node), which means
		 * we need to consider it as external, otherwise tsup (esbuild) will bundle it altogether.
		 * */
		"zod",
	],
});
