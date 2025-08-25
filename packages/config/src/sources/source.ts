import { flattenObject } from "es-toolkit";
import { get, set } from "es-toolkit/compat";
import type {
	ClientConfigBuilderOptions,
	Prettify,
	RuntimeEnvValue,
	ServerConfigBuilderOptions,
	UnknownArray,
	UnknownRecord,
} from "../types";
import { extractSlotsFromExpression, hasSlot, type Slot } from "../utils/slot";

const UNDEFINED_MARKER = "___UNDEFINED_MARKER___" as const;

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
		const initialObject = options.transform(options.contentString);
		/**
		 * If there's no slot, we don't need to do anything
		 */
		if (!hasSlot(options.contentString, options.slotPrefix)) {
			return initialObject;
		}

		const finalObject: FlattenedObject = {};

		// const mappedSlots = this.#extractSlots(flattenedObject, options.slotPrefix);

		for (const [propertyPath, slotValue] of Object.entries(
			flattenObject(initialObject as UnknownRecord) as [string, string],
		)) {
			if (hasSlot(slotValue, options.slotPrefix)) {
				const { envVarSlots, selfReferenceSlots } = extractSlotsFromExpression(
					slotValue,
					options.slotPrefix,
				);

				// let envVarValue: RuntimeEnvValue | undefined;
				let updatedSlotValue = slotValue;

				for (const envVarSlot of envVarSlots) {
					const envVarValue = options.runtimeEnv[envVarSlot.envVar];

					if (envVarValue !== null && envVarValue !== undefined) {
						// a = envVarSlot.fullMatch;
						// If we found a value for the env var, we can stop looking
						updatedSlotValue = updatedSlotValue.replaceAll(
							envVarSlot.fullMatch,
							String(envVarValue),
						);
						break;
					}
				}

				console.log(updatedSlotValue);

				for (const selfReferenceSlot of selfReferenceSlots) {
					const propertyValue = get(
						finalObject,
						selfReferenceSlot.propertyPath,
					);
				}

				set(finalObject, propertyPath, updatedSlotValue);
			} else {
				set(finalObject, propertyPath, slotValue);
			}
		}

		return finalObject;
	}

	// #extractSlots(
	// 	obj: FlattenedObject,
	// 	slotPrefix: string,
	// ): Map<ObjectPath, Slot[]> {
	// 	const result: Map<ObjectPath, Slot[]> = new Map();

	// 	for (const [path, value] of Object.entries(obj)) {
	// 		const existingSlots = result.get(path);

	// 		// If not string, it can't have slots
	// 		if (typeof value !== "string") {
	// 			continue;
	// 		}

	// 		if (hasSlot(value, slotPrefix) === false) {
	// 			continue;
	// 		}

	// 		if (existingSlots) {
	// 			result.set(path, [
	// 				...existingSlots,
	// 				...extractSlotsFromExpression(value, slotPrefix),
	// 			]);
	// 		} else {
	// 			result.set(path, extractSlotsFromExpression(value, slotPrefix));
	// 		}
	// 	}

	// 	return result;
	// }

	#cleanUndefinedMarkers<T = unknown>(value: T): any {
		if (value === UNDEFINED_MARKER) {
			return undefined;
		}

		if (typeof value === "string" && value.includes(UNDEFINED_MARKER)) {
			// If it's mixed content with undefined slots, return undefined
			return undefined;
		}

		if (Array.isArray(value)) {
			const newList: any[] = [];

			for (const item of value) {
				const cleanedItem = this.#cleanUndefinedMarkers(item);
				if (cleanedItem !== undefined) {
					newList.push(cleanedItem);
				}
			}

			return newList;
		}

		if (value && typeof value === "object") {
			const result: UnknownRecord = {};

			for (const [oKey, oValue] of Object.entries(value)) {
				result[oKey] = this.#cleanUndefinedMarkers(oValue);
			}

			return result;
		}

		return value;
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
