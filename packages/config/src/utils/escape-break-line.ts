export function escapeBreakLine<T = unknown>(value: T): T {
	if (typeof value !== "string") {
		return value;
	}

	return value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t") as T;
}
