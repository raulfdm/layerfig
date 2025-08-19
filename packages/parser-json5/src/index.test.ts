import path from "node:path";
import {
	ConfigBuilder,
	type ConfigBuilderOptions,
	FileSource,
} from "@layerfig/config";
import { describe, expect, it } from "vitest";
import json5Parser from "./index";

describe("json5Parser", () => {
	it("should load config from .json file", () => {
		const result = getConfig().addSource(new FileSource("base.json")).build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .jsonc file", () => {
		const result = getConfig().addSource(new FileSource("base.jsonc")).build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .json5 file", () => {
		const result = getConfig().addSource(new FileSource("base.json5")).build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should add layer json files", () => {
		expect(
			getConfig()
				.addSource(new FileSource("base.jsonc"))
				.addSource(new FileSource("dev.jsonc"))
				.build(),
		).toEqual({
			appURL: "https://dev.company-app.com",
			api: {
				port: 3000,
			},
		});

		expect(
			getConfig()
				.addSource(new FileSource("dev.jsonc"))
				.addSource(new FileSource("base.jsonc"))
				.build(),
		).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should throw an error if the file extension is not supported", () => {
		expect(() =>
			getConfig().addSource(new FileSource("base.yaml")).build(),
		).toThrowError();
	});
});

function getConfig(options?: Partial<ConfigBuilderOptions>) {
	return new ConfigBuilder({
		validate: (config, z) =>
			z
				.object({
					appURL: z.url(),
					api: z.object({
						port: z.coerce.number(),
					}),
				})
				.parse(config),
		absoluteConfigFolderPath: path.resolve(process.cwd(), "./src/__fixtures__"),
		parser: json5Parser,
		...options,
	});
}
