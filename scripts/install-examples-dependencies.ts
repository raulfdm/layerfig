import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const examplesDirAbsolutePath = path.resolve(__dirname, "../examples");

const allExamplesDirectories = fs.readdirSync(examplesDirAbsolutePath);

class ExampleDir {
	#packageManager: "deno" | "npm" | "bun";
	#absolutePath: string;

	constructor(dirname: string) {
		this.#absolutePath = path.join(examplesDirAbsolutePath, dirname);
		const files = fs.readdirSync(this.#absolutePath);

		for (const file of files) {
			if (file === "deno.json") {
				this.#packageManager = "deno";
			} else if (file === "package-lock.json") {
				this.#packageManager = "npm";
			} else if (file === "bun.lock") {
				this.#packageManager = "bun";
			}
		}

		if (!this.#packageManager) {
			throw new Error(`No package package defined for ${dirname}`);
		}
	}

	installDependencies() {
		return $`cd ${this.#absolutePath} && ${this.#packageManager} install`;
	}
}

for (const exampleDir of allExamplesDirectories) {
	const example = new ExampleDir(exampleDir);
	await example.installDependencies();
}
