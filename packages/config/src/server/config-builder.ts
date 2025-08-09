import { merge } from "es-toolkit/compat";
import { Source } from "../sources/source";
import type { UnknownRecord } from "../types";
import { z } from "./index";
import {
	ServerConfigBuilderOptions,
	type ValidatedServerConfigBuilderOptions,
} from "./types";

export class ConfigBuilder<T extends object = UnknownRecord> {
	#options: ValidatedServerConfigBuilderOptions;

	#sources: Source[] = [];

	constructor(options: ServerConfigBuilderOptions<T>) {
		this.#options = ServerConfigBuilderOptions.parse(options);
	}

	/* Public */
	public build(): T {
		if (this.#sources.length === 0) {
			throw new Error(
				"No source was added. Please provide one by using .addSource(<source>)",
			);
		}

		let partialConfig: UnknownRecord = {};

		for (const source of this.#sources) {
			const data = source.loadSource({
				parser: this.#options.parser,
				runtimeEnv: this.#options.runtimeEnv,
				slotPrefix: this.#options.slotPrefix,
				relativeConfigFolderPath: this.#options.configFolder,
			});

			partialConfig = merge({}, partialConfig, data);
		}

		return this.#options.validate(partialConfig, z) as T;
	}

	public addSource(source: Source): this {
		if (source instanceof Source === false) {
			throw new Error(
				"Invalid source. Please provide a valid one (EnvironmentVariableSource, FileSource, or ObjectSource)",
			);
		}

		this.#sources.push(source);

		return this;
	}
}

export type ConfigBuilderOptions = ServerConfigBuilderOptions;
