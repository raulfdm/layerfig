import { ConfigBuilder } from "@layerfig/config";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import tomlParser from "./index";

const schema = z.object({
	appURL: z.url(),
	cache: z.object({
		port: z.number(),
		host: z.string(),
	}),
});

describe("tomlParser", () => {
	const config = new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
		parser: tomlParser,
	});

	it("should load config from .toml file", () => {
		const result = config.addSource("base.toml").build();

		expect(result).toEqual({
			appURL: "http://localhost:3000",
			cache: {
				host: "localhost",
				port: 6379,
			},
		});
	});

	it("should add layer json files", () => {
		expect(config.addSource("base.toml").addSource("dev.toml").build()).toEqual(
			{
				appURL: "https://dev.company-app.com",
				cache: {
					host: "dns.to.redis-company.com",
					port: 6379,
				},
			},
		);

		expect(config.addSource("dev.toml").addSource("base.toml").build()).toEqual(
			{
				appURL: "http://localhost:3000",
				cache: {
					host: "localhost",
					port: 6379,
				},
			},
		);
	});

	it("should throw an error if the file extension is not supported", () => {
		expect(() => config.addSource("base.yaml").build()).toThrowError();
	});
});
