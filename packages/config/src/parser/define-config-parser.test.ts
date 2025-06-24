import { describe, expect, it } from "vitest";
import { defineConfigParser } from "./define-config-parser";

describe("fn: defineConfigParser", () => {
	it("should return the expected methods", () => {
		const parser = defineConfigParser({
			acceptedFileExtensions: [".json"],
			parse(fileContent) {
				return {
					ok: true,
					data: {
						fileContent,
					},
				};
			},
		});

		expect(parser).toEqual({
			acceptsExtension: expect.any(Function),
			load: expect.any(Function),
			acceptedFileExtensions: [".json"],
		});
	});

	it("should return parser result of the factory when called it", () => {
		const resulSuccess = {
			ok: true,
			data: {
				foo: "bar",
			},
		};

		const parser = defineConfigParser({
			acceptedFileExtensions: [".json"],
			parse() {
				return resulSuccess;
			},
		});

		expect(parser.load('{ "foo": "bar" }')).toEqual(resulSuccess);
	});

	describe(".acceptsExtension", () => {
		it("should return true if extension is accepted", () => {
			const parser = defineConfigParser({
				acceptedFileExtensions: ["json", "jsonc"],
				parse() {
					return {
						ok: true,
						data: {},
					};
				},
			});

			expect(parser.acceptsExtension("json")).toBe(true);
			expect(parser.acceptsExtension("jsonc")).toBe(true);
		});

		it("should return handles extensions with or without '.'", () => {
			const parser = defineConfigParser({
				acceptedFileExtensions: ["json", ".jsonc"],
				parse() {
					return {
						ok: true,
						data: {},
					};
				},
			});

			expect(parser.acceptsExtension(".json")).toBe(true);
			expect(parser.acceptsExtension(".jsonc")).toBe(true);
			expect(parser.acceptsExtension("jsonc")).toBe(true);
		});

		it("should return false if extension is not accepted", () => {
			const parser = defineConfigParser({
				acceptedFileExtensions: ["json", "jsonc"],
				parse() {
					return {
						ok: true,
						data: {},
					};
				},
			});

			expect(parser.acceptsExtension("yaml")).toBe(false);
			expect(parser.acceptsExtension("toml")).toBe(false);
		});
	});
});
