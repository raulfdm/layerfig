import { isPlainObject } from "./is-plain-object";

type MergeResult<T extends Record<string, unknown>[]> = T extends [
	infer First,
	...infer Rest,
]
	? First extends Record<string, unknown>
		? Rest extends Record<string, unknown>[]
			? First & MergeResult<Rest>
			: First
		: Record<string, unknown>
	: Record<string, unknown>;

/**
 * Deep merge objects (lodash merge replacement)
 * More flexible version that accepts any objects
 */
export function merge<
	T extends Record<string, unknown>,
	U extends Record<string, unknown>[],
>(target: T, ...sources: U): T & MergeResult<U>;
export function merge<T extends Record<string, unknown>>(
	target: T,
	...sources: Record<string, unknown>[]
): T & Record<string, unknown> {
	if (!sources.length) return target;
	const source = sources.shift();

	if (!source) return merge(target, ...sources);

	if (isPlainObject(target) && isPlainObject(source)) {
		for (const key in source) {
			const sourceValue = source[key];
			const targetValue = target[key];

			if (isPlainObject(sourceValue)) {
				if (!targetValue || !isPlainObject(targetValue)) {
					(target as Record<string, unknown>)[key] = {};
				}
				merge(target[key] as Record<string, unknown>, sourceValue);
			} else {
				(target as Record<string, unknown>)[key] = sourceValue;
			}
		}
	}

	return merge(target, ...sources) as T & Record<string, unknown>;
}
