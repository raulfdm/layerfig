import { get } from "es-toolkit/compat";
import type {
	ClientConfigBuilderOptions,
	Prettify,
	RuntimeEnvValue,
	ServerConfigBuilderOptions,
	UnknownArray,
	UnknownRecord,
} from "../types";
import { escapeBreakLine } from "../utils/escape-break-line";
import { extractSlotsFromExpression, hasSlot, type Slot } from "../utils/slot";

const UNDEFINED_MARKER = "___UNDEFINED_MARKER___" as const;

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

		const slots = this.#extractSlots(
			initialObject as UnknownRecord,
			options.slotPrefix,
		);

		/**
		 * At this moment it does not matter what parser the user had defined,
		 * we're in the JS/JSON land.
		 */
		let updatedContentString = JSON.stringify(initialObject);

		for (const slot of slots) {
			let envVarValue: RuntimeEnvValue;

			for (const reference of slot.references) {
				if (reference.type === "env_var") {
					envVarValue = options.runtimeEnv[reference.envVar];
				}

				if (reference.type === "self_reference") {
					const partialObj = JSON.parse(updatedContentString);

					envVarValue = get(
						partialObj,
						reference.propertyPath,
					) as RuntimeEnvValue;
				}

				if (envVarValue !== null && envVarValue !== undefined) {
					// If we found a value for the env var, we can stop looking
					break;
				}
			}

			if (!envVarValue && slot.fallbackValue) {
				envVarValue = slot.fallbackValue;
			}

			const valueToInsert =
				envVarValue !== null && envVarValue !== undefined
					? String(envVarValue)
					: UNDEFINED_MARKER;

			updatedContentString = updatedContentString.replaceAll(
				slot.slotMatch,
				escapeBreakLine(valueToInsert),
			);
		}

		const partialConfig = this.#cleanUndefinedMarkers(
			JSON.parse(updatedContentString),
		);

		return partialConfig;
	}

	#extractSlots(
		value: UnknownRecord | UnknownArray,
		slotPrefix: string,
	): Slot[] {
		const result: Slot[] = [];

		if (Array.isArray(value)) {
			for (const item of value) {
				result.push(...this.#extractSlots(item as UnknownRecord, slotPrefix));
			}
		} else if (typeof value === "string") {
			result.push(...extractSlotsFromExpression(value, slotPrefix));
		} else if (value && typeof value === "object") {
			for (const [_, v] of Object.entries(value)) {
				if (typeof v === "string") {
					result.push(...extractSlotsFromExpression(v, slotPrefix));
				} else {
					result.push(...this.#extractSlots(v as UnknownRecord, slotPrefix));
				}
			}
		}

		return result;
	}

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
