import type { LoadSourceOptions, PartialDeepUnknown, Prettify } from "../types";
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

	override loadSource({
		slotPrefix,
		runtimeEnv,
	}: Pick<LoadSourceOptions, "runtimeEnv" | "slotPrefix">): Prettify<T> {
		return this.maybeReplaceSlots({
			contentString: JSON.stringify(this.#object),
			slotPrefix,
			runtimeEnv,
			transform: (contentString) => JSON.parse(contentString) as Prettify<T>,
		});
	}
}
