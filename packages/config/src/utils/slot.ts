interface EnvVarSlot {
	type: "env_var";
	envVar: string;
	part: string;
}

export interface SelfReferenceSlot {
	type: "self_reference";
	propertyPath: string;
	part: string;
}

export interface ExtractedSlotReturn {
	references: (SelfReferenceSlot | EnvVarSlot)[];
	fallbackValue?: string;
	fullMatch: string;
}

export function extractSlotsFromExpression(
	content: string | boolean | number,
	slotPrefix: string,
): ExtractedSlotReturn {
	const regex = getTemplateRegex(slotPrefix);

	let match: RegExpExecArray | null;
	const references: (SelfReferenceSlot | EnvVarSlot)[] = [];
	let fallbackValue: string | undefined;

	// biome-ignore lint/suspicious/noAssignInExpressions: easy brow, it's fine.
	while ((match = regex.exec(String(content))) !== null) {
		const [_, slotValue] = match;

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

				references.push({
					type: "self_reference",
					propertyPath,
					part: slotPart,
				});
			} else {
				references.push({
					type: "env_var",
					envVar: slotPart,
					part: slotPart,
				});
			}
		}
	}

	return {
		references,
		fallbackValue,
		fullMatch: String(content),
	};
}

export function hasSlot(
	content: string | boolean | number,
	slotPrefix: string,
): boolean {
	const regex = getTemplateRegex(slotPrefix);
	return regex.test(String(content));
}

export function hasSelfReference(content: string | boolean | number): boolean {
	return content.toLocaleString().includes("self.");
}

function getTemplateRegex(slotPrefix: string) {
	// Escape special regex characters in the prefix
	const escapedPrefix = slotPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	// Build the regex pattern
	return new RegExp(`${escapedPrefix}\\{([^}]*)\\}`, "g");
}
