import { merge } from "es-toolkit/compat";
import { Source } from "../sources/source";
import type {
	UnknownRecord,
	ValidatedServerConfigBuilderOptions,
} from "../types";
import { resolveSlots } from "../utils/resolve-slots";
import { z } from "./index";
import {
	type ConfigBuilderOptions,
	ServerConfigBuilderOptionsSchema,
} from "./types";

export class ConfigBuilder<T extends object = UnknownRecord> {
	#options: ValidatedServerConfigBuilderOptions;

	#sources: Source[] = [];

	constructor(options: ConfigBuilderOptions<T>) {
		this.#options = ServerConfigBuilderOptionsSchema.parse(options);
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
			const data = source.loadSource(this.#options);

			partialConfig = merge({}, partialConfig, data);
		}

		/**
		 * Slots are resolved only after every source was merged so a slot
		 * (specially a self-referencing one) can point to a value defined
		 * in any other source.
		 */
		const finalConfig = resolveSlots(partialConfig, {
			runtimeEnv: this.#options.runtimeEnv,
			slotPrefix: this.#options.slotPrefix,
		});

		return this.#options.validate(finalConfig, z) as T;
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
