import { describe, expect, it } from "vitest";
import { escapeBreakLine } from "./escape-break-line";

describe("escapeBreakLine", () => {
	it("should escape newlines", () => {
		const input = "line1\nline2\nline3";
		const expected = "line1\\nline2\\nline3";
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should escape double quotes", () => {
		const input = 'He said "Hello World"';
		const expected = 'He said \\"Hello World\\"';
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should escape backslashes", () => {
		const input = "path\\to\\file";
		const expected = "path\\\\to\\\\file";
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should escape carriage returns", () => {
		const input = "line1\rline2";
		const expected = "line1\\rline2";
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should escape tabs", () => {
		const input = "col1\tcol2\tcol3";
		const expected = "col1\\tcol2\\tcol3";
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should handle empty string", () => {
		expect(escapeBreakLine("")).toBe("");
	});

	it("should handle string with no special characters", () => {
		const input = "simple string";
		expect(escapeBreakLine(input)).toBe(input);
	});

	it("should escape multiple special characters in correct order", () => {
		const input = 'test\\with"quotes\nand\ttabs';
		const expected = 'test\\\\with\\"quotes\\nand\\ttabs';
		expect(escapeBreakLine(input)).toBe(expected);
	});

	it("should handle PEM key format", () => {
		const pemKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINofexMSQApYFYPK1/oISaOG4BgHm9SEkiHRUQOcmloToAoGCCqGSM49
AwEHoUQDQgAEoRFl5IWEgK9PTCvI8lzT1kBdvFvVw/EZzKT8XHQczrBnVSc+S8qw
tQrWvRJknz7jP0GHpvUm2GXHx6aOcbdBag==
-----END EC PRIVATE KEY-----`;

		const escaped = escapeBreakLine(pemKey);

		// Should not contain actual newlines
		expect(escaped).not.toContain("\n");
		// Should contain escaped newlines
		expect(escaped).toContain("\\n");
		// Should start and end correctly
		expect(escaped).toMatch(/^-----BEGIN EC PRIVATE KEY-----\\n/);
		expect(escaped).toMatch(/\\n-----END EC PRIVATE KEY-----$/);
	});

	it("should handle complex strings with all escape characters", () => {
		const input = 'backslash: \\ quote: " newline: \n tab: \t carriage: \r';
		const expected =
			'backslash: \\\\ quote: \\" newline: \\n tab: \\t carriage: \\r';
		expect(escapeBreakLine(input)).toBe(expected);
	});
});
