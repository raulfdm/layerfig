import { ObjectSource } from "../sources/object";
import type { ClientConfigBuilderOptions } from "../types";
import { merge } from "../utils";
import * as zodMini from "../zod-mini";

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ClientConfigBuilderOptions<T>;

	#sources: ObjectSource[] = [];

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

		return this.#options.validate(partialConfig, zodMini);
	}

	public addSource(source: ObjectSource): this {
		if (source instanceof ObjectSource === false) {
			throw new Error("Invalid source. Please provide a valid one.");
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
