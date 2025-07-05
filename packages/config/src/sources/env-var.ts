import { z } from "zod/v4";
import { set } from "../utils/set";
import type { LoadSourceOptions, Source } from "./type";

const EnvironmentVariableSourceOptions = z.object({
	/**
	 * The environment variable prefix to use
	 * @default 'APP
	 */
	prefix: z.string().optional().default("APP"),
	/**
	 * The separator to use between the prefix and the key
	 * @default '_'
	 */
	prefixSeparator: z.string().optional().default("_"),
	/**
	 * The separator to navigate the object
	 * @default '__'
	 */
	separator: z.string().optional().default("__"),
});

type EnvironmentVariableSourceOptions = z.Infer<
	typeof EnvironmentVariableSourceOptions
>;

export class EnvironmentVariableSource implements Source {
	#options: EnvironmentVariableSourceOptions;
	#prefixWithSeparator: string;

	constructor(options: Partial<EnvironmentVariableSourceOptions> = {}) {
		this.#options = EnvironmentVariableSourceOptions.parse(options);

		this.#prefixWithSeparator = `${this.#options.prefix}${this.#options.prefixSeparator}`;
	}

	loadSource({ runtimeEnv }: LoadSourceOptions): Record<string, unknown> {
		const envKeys = Object.keys(runtimeEnv).filter((key) =>
			key.startsWith(this.#prefixWithSeparator),
		);

		const tempObject = {} as Record<string, unknown>;

		for (const envKey of envKeys) {
			const keyWithoutPrefix = envKey.replace(this.#prefixWithSeparator, "");
			const keyParts = keyWithoutPrefix
				.split(this.#options.separator)
				.join(".");

			set(tempObject, keyParts, runtimeEnv[envKey]);
		}

		return tempObject;
	}
}
