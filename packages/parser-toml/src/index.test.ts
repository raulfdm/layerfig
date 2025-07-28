import {
	ConfigBuilder,
	type ConfigBuilderOptions,
	FileSource,
} from "@layerfig/config";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import tomlParser from "./index";

describe("tomlParser", () => {
	it("should load config from .toml file", () => {
		const result = getConfig().addSource(new FileSource("base.toml")).build();

		expect(result).toEqual({
			appURL: "http://localhost:3000",
			cache: {
				host: "localhost",
				port: 6379,
			},
		});
	});

	it("should add layer json files", () => {
		expect(
			getConfig()
				.addSource(new FileSource("base.toml"))
				.addSource(new FileSource("dev.toml"))
				.build(),
		).toEqual({
			appURL: "https://dev.company-app.com",
			cache: {
				host: "dns.to.redis-company.com",
				port: 6379,
			},
		});

		expect(
			getConfig()
				.addSource(new FileSource("dev.toml"))
				.addSource(new FileSource("base.toml"))
				.build(),
		).toEqual({
			appURL: "http://localhost:3000",
			cache: {
				host: "localhost",
				port: 6379,
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
	const schema = z.object({
		appURL: z.url(),
		cache: z.object({
			port: z.number(),
			host: z.string(),
		}),
	});
	return new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
		parser: tomlParser,
		...options,
	});
}
