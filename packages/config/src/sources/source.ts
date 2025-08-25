import { flattenObject } from "es-toolkit";
import { get, set } from "es-toolkit/compat";
import type {
	ClientConfigBuilderOptions,
	Prettify,
	ServerConfigBuilderOptions,
	UnknownRecord,
} from "../types";
import { extractSlotsFromExpression, hasSlot } from "../utils/slot";

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

		for (const [propertyPath, slotValue] of Object.entries(
			flattenObject(initialObject as UnknownRecord) as [string, string],
		)) {
			if (hasSlot(slotValue, options.slotPrefix)) {
				const { envVarSlots, selfReferenceSlots } = extractSlotsFromExpression(
					slotValue,
					options.slotPrefix,
				);

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

				for (const selfReferenceSlot of selfReferenceSlots) {
					const propertyValue = get(
						finalObject,
						selfReferenceSlot.propertyPath,
					);

					updatedSlotValue = updatedSlotValue.replaceAll(
						selfReferenceSlot.fullMatch,
						String(propertyValue),
					);
				}

				set(finalObject, propertyPath, updatedSlotValue);
			} else {
				set(finalObject, propertyPath, slotValue);
			}
		}

		return finalObject;
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
