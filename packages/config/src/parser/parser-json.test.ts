import { describe, expect, it } from "vitest";
import { basicJsonParser } from "./parser-json";

describe("fn: basicJsonParser", () => {
	describe("accepts", () => {
		it("should return true if json", () => {
			expect(basicJsonParser.acceptsExtension("json")).toBe(true);
		});

		it("should return false for anything else", () => {
			for (const fileExtension of [
				"ini",
				"json5",
				"jsonc",
				"properties",
				"toml",
				"yaml",
				"yml",
			]) {
				expect(basicJsonParser.acceptsExtension(fileExtension)).toBe(false);
			}
		});
	});

	describe(".load", () => {
		it("should returns the json passed as object", () => {
			const json = { key: "value" };

			expect(basicJsonParser.load(JSON.stringify(json))).toEqual({
				ok: true,
				data: json,
			});
		});

		it("should return error if json content is not json", () => {
			expect(basicJsonParser.load("port: 3000")).toEqual({
				ok: false,
				error: expect.any(SyntaxError),
			});
		});
	});
});
