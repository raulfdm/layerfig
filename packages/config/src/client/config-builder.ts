import { merge } from "es-toolkit/compat";
import { EnvironmentVariableSource } from "../sources/env-var";
import { ObjectSource } from "../sources/object";
import type { ClientConfigBuilderOptions } from "../types";
import { z as zmini } from "../zod-mini";

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ClientConfigBuilderOptions<T>;

	#sources: (ObjectSource | EnvironmentVariableSource)[] = [];

	constructor(options: ClientConfigBuilderOptions<T>) {
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
				runtimeEnv: this.#runtime,
				slotPrefix: this.#slotPrefix,
			});

			partialConfig = merge({}, partialConfig, data);
		}

		return this.#options.validate(partialConfig, zmini);
	}

	public addSource(source: ObjectSource | EnvironmentVariableSource): this {
		if (
			!(
				source instanceof ObjectSource ||
				source instanceof EnvironmentVariableSource
			)
		) {
			throw new Error(
				"Invalid source. Please provide either EnvironmentVariableSource or ObjectSource.",
			);
		}

		this.#sources.push(source);

		return this;
	}

	/* Private */
	get #runtime() {
		return this.#options.runtimeEnv || import.meta.env || {};
	}

	get #slotPrefix() {
		return this.#options.slotPrefix || "$";
	}
}

export type ConfigBuilderOptions = ClientConfigBuilderOptions;
