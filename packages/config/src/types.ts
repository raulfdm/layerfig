import { z } from "./zod-mini";

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

export const RuntimeEnv = z.pipe(
	/**
	 * This transformation is needed because we're dealing with process.env in most of the cases.
	 * It seems that process.env (for NodeJS environment) isn't a plain object for zod so
	 * it'll never validate correctly.
	 *
	 * So this is a workaround to always "spread" the received object and transform it into a plain object.
	 * @see https://github.com/colinhacks/zod/issues/5069#issuecomment-3166763647
	 */
	z.transform((env) => {
		return Object.assign({}, env);
	}),
	z.record(z.string(), z.union([z.string(), z.undefined()])),
);

export type RuntimeEnv = z.output<typeof RuntimeEnv>;

export interface BaseConfigBuilderOptions {
	/**
	 * Prefix used to search for slotted values
	 * @default "$"
	 */
	slotPrefix?: string;
}

export const BaseConfigBuilderOptions = z.object({
	slotPrefix: z._default(z.string(), "$"),
}) satisfies z.ZodMiniType<BaseConfigBuilderOptions>;

export type UnknownRecord = Record<string, unknown>;
