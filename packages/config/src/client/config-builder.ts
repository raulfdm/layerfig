import { merge } from "es-toolkit/compat";
import type { EnvironmentVariableSource } from "../sources/env-var";
import type { ObjectSource } from "../sources/object";

import { z } from "./index";
import {
	ClientConfigBuilderOptions,
	ClientSources,
	type ValidateClientConfigBuilderOptions,
} from "./types";

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ValidateClientConfigBuilderOptions;

	#sources: ClientSources[] = [];

	constructor(options: ClientConfigBuilderOptions<T>) {
		this.#options = ClientConfigBuilderOptions.parse(options);
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
				runtimeEnv: this.#options.runtimeEnv,
				slotPrefix: this.#options.slotPrefix,
			});

			partialConfig = merge({}, partialConfig, data);
		}

		return this.#options.validate(partialConfig, z) as T;
	}

	public addSource(source: ObjectSource | EnvironmentVariableSource): this {
		const validatedSourceResult = ClientSources.safeParse(source);

		if (!validatedSourceResult.success) {
			throw new Error(z.prettifyError(validatedSourceResult.error));
		}

		this.#sources.push(validatedSourceResult.data);

		return this;
	}
}

export type ConfigBuilderOptions = ClientConfigBuilderOptions;
