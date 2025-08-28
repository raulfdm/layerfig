import { flattenObject } from "es-toolkit";
import { get, set } from "es-toolkit/compat";
import type {
	ClientConfigBuilderOptions,
	Prettify,
	RuntimeEnvValue,
	ServerConfigBuilderOptions,
	UnknownRecord,
} from "../types";
import {
	type ExtractedSlotReturn,
	extractSlotsFromExpression,
	hasSelfReference,
	hasSlot,
	type SelfReferenceSlot,
} from "../utils/slot";

type ObjectPath = string;
type FlattenObjectValue = string | boolean | number;
type FlattenedObject = Record<ObjectPath, FlattenObjectValue>;

export abstract class Source<T = Record<string, unknown>> {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(loadSourceOptions: LoadSourceOptions): Prettify<T>;

	maybeReplaceSlots<T>(options: MaybeReplaceSlotsOptions<T>) {
		// debugger;
		const initialObject = options.transform(options.contentString);

		/**
		 * If there's no slot, we don't need to do anything
		 */
		if (!hasSlot(options.contentString, options.slotPrefix)) {
			return initialObject;
		}

		const flattenedObject = flattenObject(initialObject as UnknownRecord);

		const propsWithoutSlots: FlattenedObject = {};
		const propsWithSlots: FlattenedObject = {};
		const slotsObjs: Map<string, ExtractedSlotReturn> = new Map();

		for (const [key, value] of Object.entries(flattenedObject) as [
			string,
			FlattenObjectValue,
		][]) {
			if (!hasSlot(value.toString(), options.slotPrefix)) {
				propsWithoutSlots[key] = value;
			} else {
				propsWithSlots[key] = value;

				slotsObjs.set(
					key,
					extractSlotsFromExpression(value, options.slotPrefix),
				);
			}
		}

		const flattenedStr = JSON.stringify(propsWithSlots);

		console.log(flattenedStr);
	}
}

type LoadSourceOptions = Prettify<
	Required<ClientConfigBuilderOptions | ServerConfigBuilderOptions>
>;

interface MaybeReplaceSlotsOptions<T = unknown>
	extends Pick<LoadSourceOptions, "runtimeEnv" | "slotPrefix"> {
	contentString: string;
	transform: (contentString: string) => T;
}
