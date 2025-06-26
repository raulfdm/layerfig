import { isPlainObject } from "./is-plain-object";

/**
 * Set value at path in object (lodash set replacement)
 * @param obj - Target object to modify
 * @param path - Path to set (dot notation string or array of keys)
 * @param value - Value to set at the path
 * @returns The modified object
 */
export function set<T extends Record<string, unknown>>(
	obj: T,
	path: string | (string | number)[],
	value: unknown,
): T {
	// Convert string path to array of keys and filter out empty strings
	const keys: (string | number)[] = Array.isArray(path)
		? path.filter((key) => key !== "" && key != null) // Filter out empty/null/undefined
		: path
				.toString()
				.split(".")
				.filter((key) => key !== "");

	// Early return if no valid keys
	if (keys.length === 0) {
		return obj;
	}

	let current: Record<string, unknown> = obj;

	// Navigate to the parent of the target key
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];

		// Type guard: ensure key is defined
		if (key == null) continue;

		// Create nested object if it doesn't exist or isn't an object
		if (!(key in current) || !isPlainObject(current[key])) {
			current[key] = {};
		}

		current = current[key] as Record<string, unknown>;
	}

	// Set the final value - with proper type checking
	const lastKey = keys[keys.length - 1];
	if (lastKey != null) {
		current[lastKey] = value;
	}

	return obj;
}
