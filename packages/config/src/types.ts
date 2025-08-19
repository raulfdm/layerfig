import type { ConfigParser } from "./parser/config-parser";
import type { z as zod } from "./zod";
import { z as zm } from "./zod-mini";

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

/**
 * Utility type to resolves complex types (specially the ones with intersection types)
 * to a more readable format.
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export const RuntimeEnv = zm.pipe(
	/**
	 * This transformation is needed because we're dealing with process.env in most of the cases.
	 * It seems that process.env (for NodeJS environment) isn't a plain object for zod so
	 * it'll never validate correctly.
	 *
	 * So this is a workaround to always "spread" the received object and transform it into a plain object.
	 * @see https://github.com/colinhacks/zod/issues/5069#issuecomment-3166763647
	 */
	zm.transform((env) => {
		return Object.assign({}, env);
	}),
	zm.record(zm.string(), zm.union([zm.string(), zm.undefined()])),
);

export type RuntimeEnv = zm.output<typeof RuntimeEnv>;

export const DEFAULT_SLOT_PREFIX = "$" as const;

export type UnknownRecord = Record<string, unknown>;
export type UnknownArray = Array<unknown>;

interface BaseConfigBuilderOptions {
	/**
	 * Prefix used to search for slotted values
	 * @default "$"
	 */
	slotPrefix?: string;
}

export interface ClientConfigBuilderOptions<T extends object = UnknownRecord>
	extends BaseConfigBuilderOptions {
	/**
	 * The runtime environment variables to use (e.g., import.meta.env, object, etc.)
	 * @default import.meta.env or {}
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 (mini) instance
	 */
	validate: (config: UnknownRecord, z: typeof zm) => T;
}

export type ValidatedClientConfigBuilderOptions<
	T extends object = UnknownRecord,
> = Required<ClientConfigBuilderOptions<T>>;

export interface ServerConfigBuilderOptions<T extends object = UnknownRecord>
	extends BaseConfigBuilderOptions {
	/**
	 * The absolute path to the folder where the configuration files are located.
	 * @default "<process.cwd()>/config"
	 */
	absoluteConfigFolderPath?: string;
	/**
	 * The runtime environment variables to use (e.g., process.env, import.meta.env, etc.)
	 * @default process.env
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * Load source from different source types
	 *
	 * @default basicJsonParser
	 */
	parser?: ConfigParser;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 instance
	 */
	validate: (config: Record<string, unknown>, z: typeof zod) => T;
}

export type ValidatedServerConfigBuilderOptions<
	T extends object = UnknownRecord,
> = Required<ServerConfigBuilderOptions<T>>;

export type LoadSourceOptions<T extends object = UnknownRecord> =
	| ValidatedClientConfigBuilderOptions<T>
	| ValidatedServerConfigBuilderOptions<T>;
