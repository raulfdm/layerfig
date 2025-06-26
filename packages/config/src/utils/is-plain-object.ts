/**
 * Type guard to check if value is a plain object
 */
export function isPlainObject(item: unknown): item is Record<string, unknown> {
	if (item === null || typeof item !== "object") {
		return false;
	}

	// Check for built-in object types that should be treated as primitives
	if (
		item instanceof Date ||
		item instanceof RegExp ||
		item instanceof Error ||
		item instanceof Map ||
		item instanceof Set ||
		item instanceof WeakMap ||
		item instanceof WeakSet ||
		Array.isArray(item)
	) {
		return false;
	}

	// Check if it's a plain object (created by {} or new Object())
	const proto = Object.getPrototypeOf(item);
	return proto === null || proto === Object.prototype;
}
