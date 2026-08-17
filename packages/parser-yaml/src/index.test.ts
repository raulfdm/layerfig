import path from "node:path";
import {
	ConfigBuilder,
	type ConfigBuilderOptions,
	FileSource,
} from "@layerfig/config";
import { describe, expect, it } from "vitest";
import yamlParser from "./index";

describe("yamlParser", () => {
	it("should load config from .yaml file", () => {
		const result = getConfig().addSource(new FileSource("base.yaml")).build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("should load config from .yml file", () => {
		const result = getConfig().addSource(new FileSource("base.yml")).build();

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
				.addSource(new FileSource("base.yaml"))
				.addSource(new FileSource("dev.yaml"))
				.build(),
		).toEqual({
			appURL: "https://dev.company-app.com",
			api: {
				port: 3000,
			},
		});

		expect(
			getConfig()
				.addSource(new FileSource("dev.yaml"))
				.addSource(new FileSource("base.yaml"))
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
			getConfig().addSource(new FileSource("base.json")).build(),
		).toThrowError();
	});

	/**
	 * Unlike JSON, YAML does not require strings to be quoted, so an unquoted
	 * slot such as `port: ${API_PORT}` used to be resolved before the file was
	 * parsed, making YAML infer the type from the replaced value ("1" became the
	 * number 1, "true" became the boolean true, ...).
	 *
	 * Slots are now resolved after parsing, so the runtime env value always
	 * lands as a string.
	 *
	 * @see https://github.com/raulfdm/layerfig/issues/163
	 */
	it("should keep unquoted slot values as strings", () => {
		const result = getConfig({
			validate: (config) => config,
			runtimeEnv: {
				APP_URL: "https://my-site.com",
				API_PORT: "3000",
				API_VERSION: "1",
				API_RATIO: "1.50",
				API_ENABLED: "true",
			},
		})
			.addSource(new FileSource("slots.yaml"))
			.build();

		expect(result).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: "3000",
				version: "1",
				ratio: "1.50",
				enabled: "true",
				nothing: undefined,
			},
		});
	});
});

function getConfig(options?: Partial<ConfigBuilderOptions>) {
	return new ConfigBuilder({
		validate: (config, z) =>
			z
				.object({
					appURL: z.url(),
					api: z.object({
						port: z.coerce.number().int().positive(),
					}),
				})
				.parse(config),
		absoluteConfigFolderPath: path.resolve(process.cwd(), "./src/__fixtures__"),
		parser: yamlParser,
		...options,
	});
}
