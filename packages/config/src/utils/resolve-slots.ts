import { get } from "es-toolkit/compat";
import type {
	RuntimeEnv,
	RuntimeEnvValue,
	UnknownArray,
	UnknownRecord,
} from "../types";
import { escapeBreakLine } from "./escape-break-line";
import { extractSlotsFromExpression, hasSlot, type Slot } from "./slot";

const UNDEFINED_MARKER = "___UNDEFINED_MARKER___" as const;

interface ResolveSlotsOptions {
	slotPrefix: string;
	runtimeEnv: RuntimeEnv;
}

/**
 * Replaces every slot (`${ENV_VAR}`, `${self.some.path}`, ...) found in the
 * given configuration object.
 *
 * This runs once, after all sources were merged, so a self-referencing slot
 * declared in one source can point to a value defined in another one.
 */
export function resolveSlots(
	config: UnknownRecord,
	options: ResolveSlotsOptions,
): UnknownRecord {
	/**
	 * At this moment it does not matter what parser the user had defined,
	 * we're in the JS/JSON land.
	 */
	let updatedContentString = JSON.stringify(config);

	/**
	 * If there's no slot, we don't need to do anything
	 */
	if (!hasSlot(updatedContentString, options.slotPrefix)) {
		return config;
	}

	const slots = extractSlots(config, options.slotPrefix);

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

	return cleanUndefinedMarkers(JSON.parse(updatedContentString));
}

function extractSlots(
	value: UnknownRecord | UnknownArray,
	slotPrefix: string,
): Slot[] {
	const result: Slot[] = [];

	if (Array.isArray(value)) {
		for (const item of value) {
			result.push(...extractSlots(item as UnknownRecord, slotPrefix));
		}
	} else if (typeof value === "string") {
		result.push(...extractSlotsFromExpression(value, slotPrefix));
	} else if (value && typeof value === "object") {
		for (const [_, v] of Object.entries(value)) {
			if (typeof v === "string") {
				result.push(...extractSlotsFromExpression(v, slotPrefix));
			} else {
				result.push(...extractSlots(v as UnknownRecord, slotPrefix));
			}
		}
	}

	return result;
}

function cleanUndefinedMarkers<T = unknown>(value: T): any {
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
			const cleanedItem = cleanUndefinedMarkers(item);
			if (cleanedItem !== undefined) {
				newList.push(cleanedItem);
			}
		}

		return newList;
	}

	if (value && typeof value === "object") {
		const result: UnknownRecord = {};

		for (const [oKey, oValue] of Object.entries(value)) {
			result[oKey] = cleanUndefinedMarkers(oValue);
		}

		return result;
	}

	return value;
}
