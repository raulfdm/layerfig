import { describe, expect, it } from "vitest";
import z from "zod/v4";
import { ConfigBuilder, type ConfigBuilderOptions } from "./config-builder";

const baseConfigBuilderOptions: ConfigBuilderOptions = {
	validate: (finalConfig, z) => {
		const schema = z.object({
			appURL: z.url(),
			api: z.object({
				port: z.coerce.number().int().positive(),
			}),
		});

		return schema.parse(finalConfig);
	},
};

describe("ConfigBuilder", () => {
	it("should throw an error if no source was added", () => {
		expect(() =>
			new ConfigBuilder(baseConfigBuilderOptions).build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: No source was added. Please provide one by using .addSource(<source>)]",
		);
	});

	it("should throw an error if the file does not exist", () => {
		try {
			getConfig().addSource(ConfigBuilder.fileSource("not-exist.json")).build();
		} catch (error) {
			const e = error as Error;
			expect(e.message).toEqual(
				expect.stringMatching(/File "[^"]+.not-exist.json" does not exist/g),
			);
		}
	});

	it("should throw if an invalid source is being passed", () => {
		expect(() =>
			getConfig()
				// @ts-expect-error - testing invalid source
				.addSource({})
				.build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: Invalid source. Please provide a valid one.]",
		);

		expect(() =>
			getConfig()
				// @ts-expect-error - testing invalid source
				.addSource(new Date())
				.build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: Invalid source. Please provide a valid one.]",
		);

		expect(() =>
			getConfig()
				// @ts-expect-error - testing invalid source
				.addSource(function foo() {})
				.build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: Invalid source. Please provide a valid one.]",
		);
	});

	describe("from json", () => {
		it("should load .json files by default", () => {
			const result = getConfig()
				.addSource(ConfigBuilder.fileSource("base.json"))
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
					.addSource(ConfigBuilder.fileSource("base.json"))
					.addSource(ConfigBuilder.fileSource("dev.json"))
					.build(),
			).toEqual({
				appURL: "https://dev.company-app.com",
				api: {
					port: 3000,
				},
			});

			expect(
				getConfig()
					.addSource(ConfigBuilder.fileSource("dev.json"))
					.addSource(ConfigBuilder.fileSource("base.json"))
					.build(),
			).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});
		});
	});

	describe("from environment variable", () => {
		it("loads source from process.env by default", () => {
			process.env.APP_appURL = "https://my-site.com";
			process.env.APP_api__port = "3000";

			const result = getConfig()
				.addSource(ConfigBuilder.envVarSource())
				.build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});

			delete process.env.APP_appURL;
			delete process.env.APP_api__port;
		});

		it("loads source from a different runtime", () => {
			const result = getConfig({
				runtimeEnv: {
					APP_appURL: "http://localhost:4422",
					APP_api__port: "4422",
				},
			})
				.addSource(ConfigBuilder.envVarSource())
				.build();

			expect(result).toEqual({
				appURL: "http://localhost:4422",
				api: {
					port: 4422,
				},
			});
		});

		it("should consider custom prefix prefixSeparator and prop separator", () => {
			process.env["TEST-appURL"] = "https://my-site.com";
			process.env["TEST-api_-_port"] = "5000";

			const result = getConfig()
				.addSource(
					ConfigBuilder.envVarSource({
						prefix: "TEST",
						prefixSeparator: "-",
						separator: "_-_",
					}),
				)
				.build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 5000,
				},
			});

			delete process.env["TEST-appURL"];
			delete process.env["TEST-api_-_port"];
		});
	});
});

const schema = z.object({
	appURL: z.url(),
	api: z.object({
		port: z.coerce.number().int().positive(),
	}),
});

function getConfig(options?: Omit<ConfigBuilderOptions, "validate">) {
	return new ConfigBuilder({
		validate: (finalConfig) => schema.parse(finalConfig),
		configFolder: "./src/__fixtures__",
		...options,
	});
}
