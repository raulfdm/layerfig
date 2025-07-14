import type { ConfigParser } from "../parser/define-config-parser";
import type { Prettify } from "../types";

interface RuntimeEnv {
	[key: string]: string | undefined;
}

export interface LoadSourceOptions {
	parser: ConfigParser;
	relativeConfigFolderPath: string;
	runtimeEnv: RuntimeEnv;
	slotPrefix: string;
}

interface MaybeReplaceSlotFromValueOptions
	extends Pick<LoadSourceOptions, "runtimeEnv" | "slotPrefix"> {
	value: string;
}

interface ExtractedSlot {
	slotPattern: RegExp;
	envVarName: string[];
	value: string;
	fallback?: string;
}

export abstract class Source<T = Record<string, unknown>> {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(loadSourceOptions: LoadSourceOptions): Prettify<T>;

	maybeReplaceSlotFromValue({
		value,
		slotPrefix,
		runtimeEnv,
	}: MaybeReplaceSlotFromValueOptions): string {
		const slots = this.#extractSlotName({
			slotPrefix,
			value,
		});

		if (slots === null) {
			return value;
		}

		let newValue = value;

		for (const slot of slots) {
			let envVarValue: string | undefined;

			for (const envVar of slot.envVarName) {
				const value = runtimeEnv[envVar];

				if (value) {
					envVarValue = value;
					break;
				}
			}

			envVarValue ??= slot.fallback;

			if (envVarValue) {
				newValue = newValue.replace(slot.slotPattern, envVarValue);
			} else {
				console.warn(
					"[SLOT_REPLACEMENT]",
					`The value for the slot "${slot.envVarName}" is not defined in the runtime environment. The slot will not be replaced.`,
				);
			}
		}

		return newValue;
	}

	#extractSlotName({
		slotPrefix,
		value,
	}: Pick<MaybeReplaceSlotFromValueOptions, "value" | "slotPrefix">):
		| ExtractedSlot[]
		| null {
		/**
		 * Something like: /\$\w+/g
		 * To match basic slots like $MY_VAR
		 */
		const basicSlotRegex = new RegExp(`\\${slotPrefix}\\w+`, "g");
		/**
		 * Something like: /\$\{.*\}/g
		 * To match multi-slot patterns like ${MY_VAR:MY_OTHER_VAR}
		 */
		const multiSlotRegex = new RegExp(`\\${slotPrefix}{.*}`, "g");

		const basicMatches = value.match(basicSlotRegex);
		const multiMatches = value.match(multiSlotRegex);

		if (!basicMatches && !multiMatches) {
			return null;
		}

		const result: ExtractedSlot[] = [];

		if (basicMatches) {
			const uniqueSlots = new Set(basicMatches);

			result.push(
				...Array.from(uniqueSlots).map((slotMatch) => ({
					envVarName: [slotMatch.replace(slotPrefix, "")],
					slotPattern: this.#safeSlotRegex(slotMatch),
					value,
				})),
			);
		}

		if (multiMatches) {
			const possibleEnvVarSlots = new Set(multiMatches);

			for (const possibleSlot of possibleEnvVarSlots) {
				let fallbackValue: string | undefined;

				const values = possibleSlot
					.replace(`${slotPrefix}{`, "")
					.replace("}", "")
					.split(":");

				// If the last value contains a hyphen, it is considered a fallback value
				if (values[values.length - 1]?.includes("-")) {
					fallbackValue = values.pop()?.trim().replace("-", "");
				}

				result.push({
					envVarName: values,
					slotPattern: this.#safeSlotRegex(possibleSlot),
					value,
					fallback: fallbackValue,
				});
			}
		}

		return result;
	}

	#safeSlotRegex(slot: string) {
		/**
		 * Escape the first character to ensure it is treated literally in the regex
		 * This is necessary because the first character could be a special regex character
		 * such as $, ^, or \, which would otherwise be interpreted by the regex engine.
		 * For example, if the slot is "$MY_VAR", we want to match it literally as "\$MY_VAR".
		 * This ensures that the regex will match the slot name exactly as it appears in the string.
		 */
		const safe = slot.replace(/^./, (m) => `\\${m}`);
		return new RegExp(safe, "gm");
	}
}
