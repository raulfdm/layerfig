import path from "node:path";
import { $ } from "bun";

const packagesPath = [
	path.resolve(__dirname, "../packages/config"),
	path.resolve(__dirname, "../packages/schema-gen"),
];

const npmToken = process.env.NPM_TOKEN;

if (!npmToken) {
	throw new Error("NPM_TOKEN is not set");
}

for (const pkgPath of packagesPath) {
	await $`NPM_CONFIG_TOKEN=${npmToken} bun publish --cwd=${pkgPath}`;
}
