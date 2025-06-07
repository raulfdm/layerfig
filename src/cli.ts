import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import { build } from "esbuild";
import meow from "meow";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import pkgJson from "../package.json" with { type: "json" };

const cli = meow(
	`
  Usage

  $ app-config --schema <path-to-schema>

  Options

  --schema      Relative path for the schema file containing the Zod schema.
                It must be default exported.

  --watch (-w)  Relative path to the output file.
    Default:    false
`,
	{
		importMeta: import.meta,
		flags: {
			schema: {
				type: "string",
				isRequired: true,
			},
			watch: {
				type: "boolean",
				default: false,
				aliases: ["w"],
			},
		},
	},
);

const PATHS = {
	rootDir: process.cwd(),
	get tempFolder() {
		return path.join(PATHS.rootDir, "./node_modules/.app-config");
	},
	output: {
		fileName: "schema.json",
		get absolutePath() {
			return path.join(PATHS.tempFolder, PATHS.output.fileName);
		},
		get relativePath() {
			return path.relative(PATHS.rootDir, PATHS.output.absolutePath);
		},
	},
	userSchema: {
		get relativePath() {
			return cli.flags.schema;
		},
		get absolutePath() {
			// Users will provide relative path
			return path.resolve(PATHS.rootDir, cli.flags.schema);
		},
		transpiled: {
			get absolutePath() {
				return path.join(PATHS.tempFolder, "transpiled-schema.mjs");
			},
		},
	},
};

main()
	.then(() => console.log(`JSON generate at: ${PATHS.output.relativePath}`))
	.catch(console.error);

async function main() {
	if ((await exists(PATHS.userSchema.absolutePath)) === false) {
		throw new Error(
			`Schema file not found at path: ${PATHS.userSchema.absolutePath}`,
		);
	}

	// to starts fresh
	await recreateFolder(PATHS.tempFolder);

	const userSchemaStr = await transpileTS(PATHS.userSchema.absolutePath);
	await writeFile(PATHS.userSchema.transpiled.absolutePath, userSchemaStr);

	const loadedUserSchema = await loadUserSchemaFromTranspiledFile();
	const jsonSchema = zodToJsonSchema(loadedUserSchema);
	await writeFile(
		PATHS.output.absolutePath,
		JSON.stringify(jsonSchema, null, 2),
	);
}

async function loadUserSchemaFromTranspiledFile() {
	const transpiledUserSchemaModule = await (import(
		/**
		 * It's important to add a query param to avoid node caching. Otherwise when regenerating the schema,
		 * the old schema will be used.
		 */
		`${PATHS.userSchema.transpiled.absolutePath}?updated=${Date.now()}`
		// biome-ignore lint/suspicious/noExplicitAny: I don't know at the point exactly what would be the type
	) as Promise<any>);
	const transpiledUserSchema = transpiledUserSchemaModule?.default;

	if (!transpiledUserSchema) {
		throw new Error("Schema file should export a default value.");
	}

	if (transpiledUserSchema?._def?.typeName !== "ZodObject") {
		throw new Error("Schema file should export a ZodObject.");
	}

	// biome-ignore lint/suspicious/noExplicitAny: @TODO: enhance this type
	const transpiledUserSchemaTyped = transpiledUserSchema as z.ZodObject<any>;

	/**
	 * Deep partial so the users don't get warnings due to missing properties in their config.
	 * At the end, all merged config will be validated against the original schema in runtime.
	 */
	return transpiledUserSchemaTyped.deepPartial().merge(
		/**
		 * We have to include the "$schema" property so the referred JSON schema don't complain about
		 * the "$schema" property being present. (A bit weird tbh)
		 */
		z.object({
			$schema: z.string(),
		}),
	);
}

async function transpileTS(entryPoint: string): Promise<string> {
	const result = await build({
		entryPoints: [entryPoint],
		bundle: true,
		platform: "node",
		target: "esnext",
		format: "esm",
		write: false,
		external: [
			...(Object.keys(pkgJson.dependencies) || {}),
			...(Object.keys(pkgJson.devDependencies) || {}),
		],
	});

	const outputCode = result.outputFiles?.[0]?.text;

	if (outputCode === undefined) {
		throw new Error("Failed to transpile the schema file.");
	}

	return outputCode;
}

if (cli.flags.watch) {
	clearConsole();
	console.log(`Watching for changes in: ${cli.flags.schema}`);
	chokidar.watch(cli.flags.schema).on("change", async () => {
		await main().then(() =>
			console.log("Schema file changed. JSON schema updated."),
		);
	});
}

async function recreateFolder(path: string) {
	await deleteIfExist(path, true);

	return fs.mkdir(path, { recursive: true });
}

async function writeFile(filePath: string, content: string) {
	await deleteIfExist(filePath);

	return fs.writeFile(filePath, content);
}

async function deleteIfExist(pathToDelete: string, recursive = false) {
	if (await exists(pathToDelete)) {
		return fs.rm(pathToDelete, { recursive, force: true });
	}
}

async function exists(pathToCheck: string) {
	try {
		await fs.access(pathToCheck, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

function clearConsole() {
	process.stdout.write("\x1Bc");
}
