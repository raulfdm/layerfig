import { describe, expect, it, test } from "vitest";
import { DEFAULT_SLOT_PREFIX } from "../types";
import { extractSlotsFromExpression, hasSlot } from "./slot";

describe("fn: extractSlotsFromExpression", () => {
	test.each([
		{
			match: "${PORT}",
			fallbackValue: undefined,
			references: [
				{
					type: "env_var",
					envVar: "PORT",
				},
			],
		},
		{
			match: "${PORT::-3000}",
			fallbackValue: "3000",
			references: [
				{
					type: "env_var",
					envVar: "PORT",
				},
			],
		},
		{
			match: "${self.hostname}",
			fallbackValue: undefined,
			references: [
				{
					type: "self_reference",
					propertyPath: "hostname",
				},
			],
		},
		{
			match: "${self.hostname::HOSTNAME}",
			fallbackValue: undefined,
			references: [
				{
					type: "self_reference",
					propertyPath: "hostname",
				},
				{
					type: "env_var",
					envVar: "HOSTNAME",
				},
			],
		},
		{
			match: "${HOSTNAME::self.hostname}",
			fallbackValue: undefined,
			references: [
				{
					type: "env_var",
					envVar: "HOSTNAME",
				},
				{
					type: "self_reference",
					propertyPath: "hostname",
				},
			],
		},
		{
			match: "${HOSTNAME::self.hostname::-localhost}",
			fallbackValue: "localhost",
			references: [
				{
					type: "env_var",
					envVar: "HOSTNAME",
				},
				{
					type: "self_reference",
					propertyPath: "hostname",
				},
			],
		},
	])(
		"Slot Match $match | Fallback $fallbackValue",
		({ match, fallbackValue, references }) => {
			const slots = extractSlotsFromExpression(match, DEFAULT_SLOT_PREFIX);
			for (const slot of slots) {
				expect(slot.slotMatch).toBe(match);
				expect(slot.fallbackValue).toBe(fallbackValue);
				expect(slot.references).toStrictEqual(references);
			}
		},
	);
});

describe("fn: hasSlot", () => {
	it("should return true if slot exists", () => {
		const content = "This is a test with ${FOO} and ${BAR::self.baz}";
		expect(hasSlot(content, DEFAULT_SLOT_PREFIX)).toBe(true);
	});

	it("should return false if slot does not exist", () => {
		const content = "This is a test without slots";
		expect(hasSlot(content, DEFAULT_SLOT_PREFIX)).toBe(false);
	});
});
