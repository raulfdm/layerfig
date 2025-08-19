interface EnvVarSlot {
	type: "env_var";
	envVar: string;
}

interface SelfReferenceSlot {
	type: "self_reference";
	propertyPath: string;
}

export function extractSlotsFromExpression(
	content: string,
	slotPrefix: string,
): Slot[] {
	const slots: Slot[] = [];
	const regex = getTemplateRegex(slotPrefix);

	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: easy brow, it's fine.
	while ((match = regex.exec(content)) !== null) {
		const [fullMatch, slotValue] = match;

		if (!slotValue) {
			throw new Error("Slot value is missing");
		}

		slots.push(new Slot(fullMatch, slotValue));
	}

	return slots;
}

export function hasSlot(content: string, slotPrefix: string): boolean {
	const regex = getTemplateRegex(slotPrefix);
	return regex.test(content);
}

export class Slot {
	#references: (SelfReferenceSlot | EnvVarSlot)[] = [];
	#slotMatch: string;
	#slotContent: string;
	#fallbackValue: string | undefined;
	#separator = "::";

	constructor(slotMatch: string, slotContent: string) {
		this.#slotMatch = slotMatch;
		this.#slotContent = slotContent;

		const slotParts = this.#slotContent.split(this.#separator);

		//Check for fallback (last value starting with -)
		if (
			slotParts.length > 1 &&
			slotParts[slotParts.length - 1]?.startsWith("-")
		) {
			this.#fallbackValue = slotParts.pop()?.slice(1);
		}

		for (const slotPart of slotParts) {
			if (slotPart.startsWith("self.")) {
				const propertyPath = slotPart.trim().replace("self.", "").trim();

				if (!propertyPath) {
					throw new Error(
						`Invalid self-referencing slot pattern: "\${self.}". Object Path is missing.`,
					);
				}

				this.#references.push({
					type: "self_reference",
					propertyPath,
				});
			} else {
				this.#references.push({
					type: "env_var",
					envVar: slotPart.trim(),
				});
			}
		}
	}

	get fallbackValue(): string | undefined {
		return this.#fallbackValue;
	}

	get slotMatch(): string {
		return this.#slotMatch;
	}

	get references(): (SelfReferenceSlot | EnvVarSlot)[] {
		return [...this.#references];
	}
}

function getTemplateRegex(slotPrefix: string) {
	// Escape special regex characters in the prefix
	const escapedPrefix = slotPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	// Build the regex pattern
	return new RegExp(`${escapedPrefix}\\{([^}]*)\\}`, "g");
}
