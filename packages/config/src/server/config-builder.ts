import type { ConfigParser } from "../parser/config-parser";
import { basicJsonParser } from "../parser/parser-json";
import { Source } from "../sources/source";
import type { ServerConfigBuilderOptions } from "../types";
import { merge } from "../utils/merge";
import * as zod from "../zod";

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ServerConfigBuilderOptions<T>;

	#sources: Source[] = [];

	constructor(options: ServerConfigBuilderOptions<T>) {
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

export type ConfigBuilderOptions = ServerConfigBuilderOptions;
