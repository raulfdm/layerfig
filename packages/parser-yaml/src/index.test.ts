import { ConfigBuilder } from "@layerfig/config";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import yamlParser from "./index";

const schema = z.object({
	appURL: z.url(),
	api: z.object({
		port: z
			.string()
			.transform((val) => Number.parseInt(val, 10))
			.or(z.number()),
	}),
});

describe("yamlParser", () => {
	const config = new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
		parser: yamlParser,
	});

	it("should load config from .yaml file", () => {
		const result = config.addSource("base.yaml").build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .yml file", () => {
		const result = config.addSource("base.yml").build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should add layer json files", () => {
		expect(config.addSource("base.yaml").addSource("dev.yaml").build()).toEqual(
			{
				appURL: "https://dev.company-app.com",
				api: {
					port: 3000,
				},
			},
		);

		expect(config.addSource("dev.yaml").addSource("base.yaml").build()).toEqual(
			{
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			},
		);
	});

	it("should throw an error if the file extension is not supported", () => {
		expect(() => config.addSource("base.json").build()).toThrowError();
	});
});
