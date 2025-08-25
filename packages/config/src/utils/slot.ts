interface EnvVarSlot {
	type: "env_var";
	envVar: string;
	fallbackValue: string | undefined;
	fullMatch: string;
}

interface SelfReferenceSlot {
	type: "self_reference";
	propertyPath: string;
	fallbackValue: string | undefined;
	fullMatch: string;
}

export function extractSlotsFromExpression(
	content: string,
	slotPrefix: string,
): {
	selfReferenceSlots: SelfReferenceSlot[];
	envVarSlots: EnvVarSlot[];
} {
	const selfReferenceSlots: SelfReferenceSlot[] = [];
	const envVarSlots: EnvVarSlot[] = [];
	const regex = getTemplateRegex(slotPrefix);

	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: easy brow, it's fine.
	while ((match = regex.exec(content)) !== null) {
		const [fullMatch, slotValue] = match;
		let fallbackValue: string | undefined;

		if (!slotValue) {
			throw new Error("Slot value is missing");
		}

		const slotParts = slotValue.split("::");

		if (
			slotParts.length > 1 &&
			slotParts[slotParts.length - 1]?.startsWith("-")
		) {
			fallbackValue = slotParts.pop()?.slice(1);
		}

		for (const slotPart of slotParts) {
			if (slotPart.startsWith("self.")) {
				const propertyPath = slotPart.trim().replace("self.", "").trim();

				if (!propertyPath) {
					throw new Error(
						`Invalid self-referencing slot pattern: "\${self.}". Object Path is missing.`,
					);
				}

				selfReferenceSlots.push({
					type: "self_reference",
					propertyPath,
					fallbackValue,
					fullMatch,
				});
			} else {
				envVarSlots.push({
					type: "env_var",
					envVar: slotPart,
					fallbackValue,
					fullMatch,
				});
			}
		}
	}

	return {
		selfReferenceSlots,
		envVarSlots,
	};
}

export function hasSlot(content: string, slotPrefix: string): boolean {
	const regex = getTemplateRegex(slotPrefix);
	return regex.test(content);
}

function getTemplateRegex(slotPrefix: string) {
	// Escape special regex characters in the prefix
	const escapedPrefix = slotPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	// Build the regex pattern
	return new RegExp(`${escapedPrefix}\\{([^}]*)\\}`, "g");
}
