import { z as zod } from "zod/v4";
import type { ConfigParser } from "./parser/define-config-parser";
import { basicJsonParser } from "./parser/parser-json";
import { Source } from "./sources/source";
import { merge } from "./utils";

export interface ConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> {
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 instance
	 */
	validate: (config: Record<string, unknown>, z: typeof zod) => T;
	/**
	 * The folder where the configuration files are located.
	 * @default "./config"
	 */
	configFolder?: string;
	/**
	 * Load source from different source types
	 */
	parser?: ConfigParser;
	/**
	 * Prefix used to search for slotted values
	 * @default "$"
	 */
	slotPrefix?: string;
	/**
	 * The runtime environment variables to use (e.g., process.env, import.env, etc.)
	 * @default process.env
	 */
	runtimeEnv?: {
		[key: string]: string | undefined;
	};
}

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ConfigBuilderOptions<T>;

	#sources: Source[] = [];

	constructor(options: ConfigBuilderOptions<T>) {
		this.#options = options;
	}

	/* Public */
	public build(): T {
		if (this.#sources.length === 0) {
			throw new Error(
				"No source was added. Please provide one by using .addSource(<source>)",
			);
		}

		let partialConfig: Record<string, unknown> = {};

		for (const source of this.#sources) {
			const data = source.loadSource({
				parser: this.#parser,
				runtimeEnv: this.#runtime,
				slotPrefix: this.#slotPrefix,
				relativeConfigFolderPath: this.#configFolder,
			});

			partialConfig = merge({}, partialConfig, data);
		}

		return this.#options.validate(partialConfig, zod);
	}

	public addSource(source: Source): this {
		if (source instanceof Source === false) {
			throw new Error("Invalid source. Please provide a valid one.");
		}

		this.#sources.push(source);

		return this;
	}

	/* Private */

	get #configFolder() {
		return this.#options.configFolder || "./config";
	}

	get #parser(): ConfigParser {
		return this.#options.parser || basicJsonParser;
	}

	get #runtime() {
		return this.#options.runtimeEnv || process.env;
	}

	get #slotPrefix() {
		return this.#options.slotPrefix || "$";
	}
}
