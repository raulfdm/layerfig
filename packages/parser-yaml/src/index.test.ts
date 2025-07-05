import { ConfigBuilder, type ConfigBuilderOptions } from "@layerfig/config";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import yamlParser from "./index";

describe("yamlParser", () => {
	it("should load config from .yaml file", () => {
		const result = getConfig()
			.addSource(ConfigBuilder.fileSource("base.yaml"))
			.build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .yml file", () => {
		const result = getConfig()
			.addSource(ConfigBuilder.fileSource("base.yml"))
			.build();

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
				.addSource(ConfigBuilder.fileSource("base.yaml"))
				.addSource(ConfigBuilder.fileSource("dev.yaml"))
				.build(),
		).toEqual({
			appURL: "https://dev.company-app.com",
			api: {
				port: 3000,
			},
		});

		expect(
			getConfig()
				.addSource(ConfigBuilder.fileSource("dev.yaml"))
				.addSource(ConfigBuilder.fileSource("base.yaml"))
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
			getConfig().addSource(ConfigBuilder.fileSource("base.json")).build(),
		).toThrowError();
	});
});

function getConfig(options?: Partial<ConfigBuilderOptions>) {
	const schema = z.object({
		appURL: z.url(),
		api: z.object({
			port: z
				.string()
				.transform((val) => Number.parseInt(val, 10))
				.or(z.number()),
		}),
	});

	return new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
		parser: yamlParser,
		...options,
	});
}
