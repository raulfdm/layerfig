import { type LoadSourceOptions, Source } from "./source";

type AnyRecord = Record<string, unknown>;

export class ObjectSource extends Source {
	#object: AnyRecord = {};

	constructor(object: AnyRecord) {
		super();

		this.#object = object;
	}

	override loadSource({
		slotPrefix,
		runtimeEnv,
	}: LoadSourceOptions): AnyRecord {
		const replacedObject = this.maybeReplaceSlotFromValue({
			value: JSON.stringify(this.#object),
			slotPrefix,
			runtimeEnv,
		});

		return JSON.parse(replacedObject);
	}
}
