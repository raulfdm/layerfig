import type { ConfigParser } from "../parser/define-config-parser";

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
	envVarName: string;
	value: string;
}

export abstract class Source {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(
		loadSourceOptions: LoadSourceOptions,
	): Record<string, unknown>;

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
			const envVarValue = runtimeEnv[slot.envVarName];

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
		const regex = new RegExp(`\\${slotPrefix}\\w+`, "g");
		const matches = value.match(regex);

		if (matches === null) {
			return null;
		}

		const uniqueSlots = new Set(matches);

		return Array.from(uniqueSlots).map((slotMatch) => ({
			envVarName: slotMatch.replace(slotPrefix, ""),
			slotPattern: this.#safeSlotRegex(slotMatch),
			value,
		}));
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
