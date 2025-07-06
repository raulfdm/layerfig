import path from "node:path";
import url from "node:url";
import { describe, expect, it } from "vitest";
import { basicJsonParser } from "../parser/parser-json";
import { FileSource } from "./file";
import type { LoadSourceOptions } from "./source";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const fixturePaths = path.resolve(__dirname, "../__fixtures__");

const baseLoadSourceOptions: LoadSourceOptions = {
	configFolderPath: fixturePaths,
	parser: basicJsonParser,
	runtimeEnv: process.env,
	slotPrefix: "$",
};

describe("FileSource", () => {
	it("load the source for a given file", () => {
		const fileSource = new FileSource("base.json");

		const result = fileSource.loadSource(baseLoadSourceOptions);

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	describe("slots", () => {
		it("should replace slots if found", () => {
			const fileSource = new FileSource("slot-multiple.json");

			const result = fileSource.loadSource({
				...baseLoadSourceOptions,
				runtimeEnv: {
					PORT: "3000",
					HOST: "localhost",
				},
			});

			expect(result).toEqual({
				appURL: "http://localhost:3000",
				port: "3000",
				host: "localhost",
			});
		});

		it("should NOT replace slots if not preset on runtime", () => {
			const fileSource = new FileSource("slot-multiple.json");

			const result = fileSource.loadSource({
				...baseLoadSourceOptions,
				runtimeEnv: {
					PORT: "3000",
				},
			});

			expect(result).toEqual({
				appURL: "http://$HOST:3000",
				port: "3000",
				host: "$HOST",
			});
		});
	});

	it("should throw error if file extension does not match the parser accepted files", () => {
		const fileSource = new FileSource("base.config");

		expect(() =>
			fileSource.loadSource(baseLoadSourceOptions),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: ".config" file is not supported by this parser. Accepted files are: "json"]`,
		);
	});

	it("should throw error if file does not exist", () => {
		const fileSource = new FileSource("random-file.json");

		try {
			fileSource.loadSource(baseLoadSourceOptions);
		} catch (e) {
			expect((e as Error).message).toStrictEqual(
				expect.stringContaining(
					'src/__fixtures__/random-file.json" does not exist',
				),
			);
		}
	});
});
