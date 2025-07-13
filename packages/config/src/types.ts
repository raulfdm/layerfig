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
