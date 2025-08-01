import { set } from "es-toolkit/compat";
import { z } from "../zod-mini";
import { type LoadSourceOptions, Source } from "./source";

const EnvironmentVariableSourceOptions = z.object({
	/**
	 * The environment variable prefix to use
	 * @default 'APP
	 */
	prefix: z._default(z.optional(z.string()), "APP"),
	/**
	 * The separator to use between the prefix and the key
	 * @default '_'
	 */
	prefixSeparator: z._default(z.optional(z.string()), "_"),
	/**
	 * The separator to navigate the object
	 * @default '__'
	 */
	separator: z._default(z.optional(z.string()), "__"),
});

type EnvironmentVariableSourceOptions = z.output<
	typeof EnvironmentVariableSourceOptions
>;
const PartialEnvironmentVariableSourceOptions = z.partial(
	EnvironmentVariableSourceOptions,
);
export type PartialEnvironmentVariableSourceOptions = z.output<
	typeof PartialEnvironmentVariableSourceOptions
>;

export class EnvironmentVariableSource extends Source {
	#options: EnvironmentVariableSourceOptions;
	#prefixWithSeparator: string;

	constructor(options: PartialEnvironmentVariableSourceOptions = {}) {
		super();
		this.#options = EnvironmentVariableSourceOptions.parse(options);

		this.#prefixWithSeparator = `${this.#options.prefix}${this.#options.prefixSeparator}`;
	}

	loadSource({
		runtimeEnv,
		slotPrefix,
	}: LoadSourceOptions): Record<string, unknown> {
		const envKeys = Object.keys(runtimeEnv).filter((key) =>
			key.startsWith(this.#prefixWithSeparator),
		);

		const tempObject = {} as Record<string, unknown>;

		for (const envKey of envKeys) {
			const envVarValue = runtimeEnv[envKey];

			if (envVarValue === undefined) {
				continue;
			}

			const keyWithoutPrefix = envKey.replace(this.#prefixWithSeparator, "");
			const keyParts = keyWithoutPrefix
				.split(this.#options.separator)
				.join(".");

			const value = this.maybeReplaceSlots({
				slotPrefix,
				contentString: envVarValue,
				runtimeEnv,
				transform: (content) => content,
			});

			set(tempObject, keyParts, value);
		}

		return tempObject;
	}
}
