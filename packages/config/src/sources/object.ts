import type { Prettify } from "../types";
import { type LoadSourceOptions, Source } from "./source";

export class ObjectSource<
	T extends object = Record<string, unknown>,
> extends Source<T> {
	#object: Prettify<T>;

	constructor(object: Prettify<T>) {
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
