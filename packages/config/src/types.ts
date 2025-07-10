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
