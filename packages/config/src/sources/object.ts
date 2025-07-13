import type { Prettify } from "../types";
import { type LoadSourceOptions, Source } from "./source";

type ObjectSourceInput<T> = {
	[K in keyof T]?: T[K] extends Record<string, unknown>
		? T[K] extends unknown[]
			? unknown // Arrays become unknown
			: T[K] extends Date
				? unknown // Dates become unknown
				: // biome-ignore lint/complexity/noBannedTypes: It's a lib, trust me
					T[K] extends Function
					? unknown // Functions become unknown
					: ObjectSourceInput<T[K]> // Recursively handle plain objects
		: unknown; // Primitives become any
};

export class ObjectSource<
	T extends object = Record<string, unknown>,
> extends Source<T> {
	#object: Prettify<ObjectSourceInput<T>>;

	// For when you pass the exact object (type inference)
	constructor(object: T);
	// For when you explicitly specify the type with flexible input
	constructor(object: ObjectSourceInput<T>);
	// Implementation
	constructor(object: T | ObjectSourceInput<T>) {
		super();
		this.#object = object;
	}

	override loadSource({
		slotPrefix,
		runtimeEnv,
	}: LoadSourceOptions): Prettify<T> {
		const replacedObject = this.maybeReplaceSlotFromValue({
			value: JSON.stringify(this.#object),
			slotPrefix,
			runtimeEnv,
		});

		return JSON.parse(replacedObject) as Prettify<T>;
	}
}
