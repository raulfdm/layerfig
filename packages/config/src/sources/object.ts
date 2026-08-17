import type { PartialDeepUnknown, Prettify } from "../types";
import { Source } from "./source";

export class ObjectSource<
	T extends object = Record<string, unknown>,
> extends Source<T> {
	#object: Prettify<PartialDeepUnknown<T>>;

	constructor(object: T); // For when you pass the exact object (type inference)
	constructor(object: PartialDeepUnknown<T>); // For when you explicitly specify the type with flexible input
	constructor(object: T | PartialDeepUnknown<T>) {
		super();
		this.#object = object;
	}

	override loadSource(): Prettify<T> {
		/**
		 * Cloning the object so any later slot replacement never mutates
		 * what the user has passed in.
		 */
		return JSON.parse(JSON.stringify(this.#object)) as Prettify<T>;
	}
}
