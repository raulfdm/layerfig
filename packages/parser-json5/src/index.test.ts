import { ConfigBuilder } from "@layerfig/config";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import json5Parser from "./index";

const schema = z.object({
	appURL: z.url(),
	api: z.object({
		port: z
			.string()
			.transform((val) => Number.parseInt(val, 10))
			.or(z.number()),
	}),
});

describe("json5Parser", () => {
	const config = new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
		parser: json5Parser,
	});

	it("should load config from .json file", () => {
		const result = config.addSource("base.json").build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .jsonc file", () => {
		const result = config.addSource("base.jsonc").build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .json5 file", () => {
		const result = config.addSource("base.json5").build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should add layer json files", () => {
		expect(
			config.addSource("base.jsonc").addSource("dev.jsonc").build(),
		).toEqual({
			appURL: "https://dev.company-app.com",
			api: {
				port: 3000,
			},
		});

		expect(
			config.addSource("dev.jsonc").addSource("base.jsonc").build(),
		).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should throw an error if the file extension is not supported", () => {
		expect(() => config.addSource("base.yaml").build()).toThrowError();
	});
});
