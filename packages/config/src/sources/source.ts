import { get } from "es-toolkit/compat";
import type {
	ClientConfigBuilderOptions,
	Prettify,
	ServerConfigBuilderOptions,
} from "../types";

export abstract class Source<T = Record<string, unknown>> {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(loadSourceOptions: LoadSourceOptions): Prettify<T>;

	maybeReplaceSlots<T>(options: MaybeReplaceSlots<T>) {
		const slots = this.#extractSlots({
			slotPrefix: options.slotPrefix,
			contentString: options.contentString,
		});

		if (slots === null) {
			return options.transform(options.contentString);
		}

		const groupedSlots = slots.reduce(
			(acc, slot) => {
				switch (slot.type) {
					case "single_variable":
						acc.single_variable = [...acc.single_variable, slot];
						break;
					case "multi_variable":
						acc.multi_variable = [...acc.multi_variable, slot];
						break;
					case "self_referencing":
						acc.self_referencing = [...acc.self_referencing, slot];
						break;
				}
				return acc;
			},
			{
				single_variable: [],
				multi_variable: [],
				self_referencing: [],
			} as {
				single_variable: SingleVariableSlot[];
				multi_variable: MultiVariableSlot[];
				self_referencing: SelfReferencingSlot[];
			},
		);

		let nextContentString = options.contentString;

		for (const slot of groupedSlots.single_variable) {
			const envVar = options.runtimeEnv[slot.envVarName];

			if (envVar) {
				nextContentString = nextContentString.replaceAll(
					slot.slotPattern,
					envVar,
				);
			} else {
				console.warn(
					"[SINGLE_VARIABLE_SLOT]",
					`The value for the slot "${slot.envVarName}" is not defined in the runtime environment. The slot will not be replaced.`,
				);
			}
		}

		for (const slot of groupedSlots.multi_variable) {
			let envVar: string | undefined;

			for (const envVarName of slot.envVarName) {
				const envVarValue = options.runtimeEnv[envVarName];

				if (envVarValue) {
					envVar = envVarValue;
					break;
				}
			}

			envVar ??= slot.fallback;

			if (envVar) {
				nextContentString = nextContentString.replaceAll(
					slot.slotPattern,
					envVar,
				);
			} else {
				console.warn(
					"[MULTI_VARIABLE_SLOT]",
					`None of the variables "${slot.envVarName.join(", ")}" are defined in the runtime environment. The slot will not be replaced.`,
				);
			}
		}

		const partialConfig = options.transform(nextContentString);

		for (const selfReferencingSlot of groupedSlots.self_referencing) {
			const propertyValue = get(
				partialConfig,
				selfReferencingSlot.propertyPath,
			);

			if (propertyValue) {
				nextContentString = nextContentString.replaceAll(
					selfReferencingSlot.slotPattern,
					propertyValue,
				);
			} else {
				console.warn(
					"[SELF_REFERENCING_SLOT]",
					`Self-referencing slot (path "${selfReferencingSlot.propertyPath}") is not defined in the config object. The slot will not be replaced.`,
				);
			}
		}

		return options.transform(nextContentString);
	}

	#extractSlots({
		slotPrefix,
		contentString,
	}: Pick<MaybeReplaceSlots, "contentString" | "slotPrefix">):
		| ExtractedSlot[]
		| null {
		/**
		 * Matches single slots like:
		 * - $FOO
		 * - ${FOO}
		 */
		const basicSlotRegex = new RegExp(
			`\\${slotPrefix}\\w+|\\${slotPrefix}{\\w+}`,
			"g",
		);

		/**
		 * Matches multi-slot patterns like:
		 * - ${FOO:BAR}
		 * - ${FOO:BAR:NAME3:-fallback value}
		 * - ${NAME1:NAME2:NAME3:-fallback value}
		 */
		const multiSlotRegex = new RegExp(
			`\\${slotPrefix}{\\w+(?::\\w+)*(?::-.+?)?}`,
			"g",
		);

		/**
		 * Matches self-referencing patterns like
		 * - ${self.foo}
		 * - ${self.foo.bar}
		 */
		const selfReferencingSlotRegex = new RegExp(
			`\\${slotPrefix}{self.([^}]*)}`,
			"gm",
		);

		const hasBasicSlot = basicSlotRegex.test(contentString);
		const hasMultiSlot = multiSlotRegex.test(contentString);
		const hasSelfReferencingSlot = selfReferencingSlotRegex.test(contentString);

		if (!hasBasicSlot && !hasMultiSlot && !hasSelfReferencingSlot) {
			return null;
		}

		const result: ExtractedSlot[] = [];

		if (hasBasicSlot) {
			const matches = contentString.match(basicSlotRegex);
			const uniqueSlots = new Set(matches);

			result.push(
				...Array.from(uniqueSlots).map(
					(slotMatch) =>
						({
							type: "single_variable",
							envVarName: slotMatch.replace(slotPrefix, ""),
							slotPattern: this.#safeSlotRegex(slotMatch),
						}) satisfies SingleVariableSlot,
				),
			);
		}

		if (hasMultiSlot) {
			const matches = contentString.match(multiSlotRegex);
			const possibleEnvVarSlots = new Set(matches);

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
					type: "multi_variable",
					envVarName: values,
					slotPattern: this.#safeSlotRegex(possibleSlot),
					fallback: fallbackValue,
				});
			}
		}

		if (hasSelfReferencingSlot) {
			for (const regexMatch of this.#extractRegexMatches(
				selfReferencingSlotRegex,
				contentString,
			)) {
				const [pattern, path] = regexMatch;

				if (!path) {
					throw new Error(
						`Invalid self-referencing slot pattern: "${pattern}". Object Path is missing.`,
					);
				}

				result.push({
					type: "self_referencing",
					propertyPath: path,
					slotPattern: this.#safeSlotRegex(pattern),
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

	#extractRegexMatches(
		regex: RegExp,
		contentString: string,
	): RegExpExecArray[] {
		const matches: RegExpExecArray[] = [];

		let currentMatch: RegExpExecArray | null;

		// Ensure the regex has the global flag to avoid infinite loops
		// Reset lastIndex to ensure we start from the beginning
		regex.lastIndex = 0;

		// biome-ignore lint/suspicious/noAssignInExpressions: Assignment in while condition is intentional for collecting all regex matches
		while ((currentMatch = regex.exec(contentString)) !== null) {
			matches.push(currentMatch);
		}

		return matches;
	}
}

type LoadSourceOptions = Prettify<
	Required<ClientConfigBuilderOptions | ServerConfigBuilderOptions>
>;

interface MaybeReplaceSlots<T = unknown>
	extends Pick<LoadSourceOptions, "runtimeEnv" | "slotPrefix"> {
	contentString: string;
	transform: (contentString: string) => T;
}

interface BaseSlot {
	slotPattern: RegExp;
}

interface SingleVariableSlot extends BaseSlot {
	type: "single_variable";
	envVarName: string;
}

interface MultiVariableSlot extends BaseSlot {
	type: "multi_variable";
	envVarName: string[];
	fallback: string | undefined;
}

interface SelfReferencingSlot extends BaseSlot {
	type: "self_referencing";
	propertyPath: string;
}

type ExtractedSlot =
	| SingleVariableSlot
	| MultiVariableSlot
	| SelfReferencingSlot;
