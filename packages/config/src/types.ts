import type { ConfigParser } from "./parser/config-parser";
import type * as zod4 from "./zod";
import type * as zod4Mini from "./zod-mini";

interface ResultSuccess<TSuccess = undefined> {
	ok: true;
	data: TSuccess;
}

interface ResultError<TError = undefined> {
	ok: false;
	error?: TError;
}

export type Result<TSuccess = undefined, TError = undefined> =
	| ResultSuccess<TSuccess>
	| ResultError<TError>;

/**
 * Utility type to resolves complex types (specially the ones with intersection types)
 * to a more readable format.
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type PartialDeepUnknown<T> = {
	[K in keyof T]?: T[K] extends Record<string, unknown>
		? T[K] extends unknown[]
			? unknown // Arrays become unknown
			: T[K] extends Date
				? unknown // Dates become unknown
				: // biome-ignore lint/complexity/noBannedTypes: It's a lib, trust me
					T[K] extends Function
					? unknown // Functions become unknown
					: PartialDeepUnknown<T[K]> // Recursively handle plain objects
		: unknown; // Primitives become any
};

type RuntimeEnv = {
	[key: string]: string | undefined;
};

export interface BaseConfigBuilderOptions {
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
}

export interface ServerConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> extends BaseConfigBuilderOptions {
	/**
	 * The runtime environment variables to use (e.g., process.env, import.meta.env, etc.)
	 * @default process.env
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 instance
	 */
	validate: (config: Record<string, unknown>, z: typeof zod4) => T;
}

export interface ClientConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> extends Omit<BaseConfigBuilderOptions, "parser" | "configFolder"> {
	/**
	 * The runtime environment variables to use (e.g., import.meta., object, e.v)
	 * @default import.meta.env
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4-mini instance
	 */
	validate: (config: Record<string, unknown>, z: typeof zod4Mini) => T;
}
