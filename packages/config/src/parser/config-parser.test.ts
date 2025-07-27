import { describe, expect, it } from "vitest";
import { ConfigParser } from "./config-parser";

describe("ConfigParser", () => {
	it("should return parser result of the factory when called it", () => {
		const resultSuccess = {
			ok: true,
			data: {
				foo: "bar",
			},
		};

		class MyParser extends ConfigParser {
			constructor() {
				super({ acceptedFileExtensions: [".json"] });
			}

			load(_foo: string) {
				return resultSuccess;
			}
		}

		expect(new MyParser().load('{ "foo": "bar" }')).toEqual(resultSuccess);
	});

	describe(".acceptsExtension", () => {
		it("should return true if extension is accepted", () => {
			class MyParser extends ConfigParser {
				constructor() {
					super({ acceptedFileExtensions: ["json", "jsonc"] });
				}

				load() {
					return {
						ok: true,
						data: {},
					};
				}
			}

			const parser = new MyParser();

			expect(parser.acceptsExtension("json")).toBe(true);
			expect(parser.acceptsExtension("jsonc")).toBe(true);
		});

		it("should return handles extensions with or without '.'", () => {
			class MyParser extends ConfigParser {
				constructor() {
					super({ acceptedFileExtensions: ["json", ".jsonc"] });
				}

				load() {
					return {
						ok: true,
						data: {},
					};
				}
			}

			const parser = new MyParser();

			expect(parser.acceptsExtension(".json")).toBe(true);
			expect(parser.acceptsExtension(".jsonc")).toBe(true);
			expect(parser.acceptsExtension("jsonc")).toBe(true);
		});

		it("should return false if extension is not accepted", () => {
			class MyParser extends ConfigParser {
				constructor() {
					super({ acceptedFileExtensions: ["json", ".jsonc"] });
				}

				load() {
					return {
						ok: true,
						data: {},
					};
				}
			}

			const parser = new MyParser();

			expect(parser.acceptsExtension("yaml")).toBe(false);
			expect(parser.acceptsExtension("toml")).toBe(false);
		});
	});
});
