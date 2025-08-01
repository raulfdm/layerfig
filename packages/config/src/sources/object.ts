import type { PartialDeepUnknown, Prettify } from "../types";
import { type LoadSourceOptions, Source } from "./source";

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
	}: LoadSourceOptions): Prettify<T> {
		const replacedObject = this.maybeReplaceSlotFromValue({
			value: JSON.stringify(this.#object),
			slotPrefix,
			runtimeEnv,
		});

		return JSON.parse(replacedObject) as Prettify<T>;
	}
}
