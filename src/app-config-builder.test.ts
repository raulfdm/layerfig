import { describe, expect, it } from "bun:test";

import { z } from "zod";
import { AppConfigBuilder } from "./app-config-builder.ts";

const schema = z.object({
	appURL: z.string(),
	api: z.object({
		port: z
			.string()
			.transform((val) => Number.parseInt(val, 10))
			.or(z.number()),
	}),
});

describe("createAppConfig", () => {
	const config = new AppConfigBuilder(schema, {
		configFolder: "./src/__fixtures__",
	});

	describe(".addSource", () => {
		describe("from environment variable", () => {
			it("loads source from process.env", () => {
				const appUrlMockEnv = injectEnvVar(
					"APP_appURL",
					"http://localhost:3000",
				);
				const apiPortMockEnv = injectEnvVar("APP_api__port", "3000");

				const result = config
					.addSource(AppConfigBuilder.createEnvVarSource())
					.build();

				expect(result).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});

				appUrlMockEnv.clean();
				apiPortMockEnv.clean();
			});

			it("loads source from a different runtime", () => {
				const runtimeEnv = import.meta.env as Record<
					string,
					string | boolean | number | undefined
				>;

				const appUrlMockEnv = injectEnvVar(
					"APP_appURL",
					"http://localhost:4422",
					runtimeEnv,
				);
				const apiPortMockEnv = injectEnvVar(
					"APP_api__port",
					"4422",
					runtimeEnv,
				);

				const result = config
					.addSource(
						AppConfigBuilder.createEnvVarSource({
							runtimeEnv,
						}),
					)
					.build();

				expect(result).toEqual({
					appURL: "http://localhost:4422",
					api: {
						port: 4422,
					},
				});

				appUrlMockEnv.clean();
				apiPortMockEnv.clean();
			});

			it("should consider custom prefix prefixSeparator and prop separator", () => {
				const appUrlMockEnv = injectEnvVar(
					"TEST-appURL",
					"http://localhost:3000",
				);
				const apiPortMockEnv = injectEnvVar("TEST-api_-_port", "5000");

				const result = config
					.addSource(
						AppConfigBuilder.createEnvVarSource({
							prefix: "TEST",
							prefixSeparator: "-",
							separator: "_-_",
						}),
					)
					.build();

				expect(result).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 5000,
					},
				});

				appUrlMockEnv.clean();
				apiPortMockEnv.clean();
			});
		});

		describe("from yaml", () => {
			const config = new AppConfigBuilder(schema, {
				configFolder: "./src/__fixtures__",
			});

			it("should add configuration from yaml file", () => {
				expect(config.addSource("base.yaml").build()).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});

				expect(config.addSource("base.yml").build()).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 5959,
					},
				});
			});

			it("should throw an error if the file does not exist", () => {
				try {
					config.addSource("not-exist.yaml").build();
				} catch (error) {
					const e = error as Error;
					expect(e.message).toEqual(
						expect.stringMatching(
							/File "[^"]+.not-exist.yaml" does not exist/g,
						),
					);
				}
			});

			it("should throw an error if tries to load an invalid resource", () => {
				try {
					config.addSource([] as never).build();
				} catch (error) {
					const e = error as Error;
					expect(e.message).toEqual(
						expect.stringMatching(
							/Invalid source. Please provide a valid one./g,
						),
					);
				}
			});

			it("should throw if the config defined does not match the schema", () => {
				const schema = z.object({
					bar: z.string(),
				});

				const config = new AppConfigBuilder(schema, {
					configFolder: "./src/__fixtures__",
				});

				try {
					config.addSource("invalid-config.json").build();
				} catch (error) {
					const e = error as Error;
					expect(e.message).toMatchInlineSnapshot(`
            "Fail to parse config: [
              {
                "code": "invalid_type",
                "expected": "string",
                "received": "undefined",
                "path": [
                  "bar"
                ],
                "message": "Required"
              }
            ]"
          `);
				}
			});
		});

		describe("from json", () => {
			const config = new AppConfigBuilder(schema, {
				configFolder: "./src/__fixtures__",
			});

			it("should add configuration from json file", () => {
				const result = config.addSource("base.json").build();

				expect(result).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});
			});

			it("should add layer json files", () => {
				expect(
					config.addSource("base.json").addSource("dev.json").build(),
				).toEqual({
					appURL: "https://dev.company-app.com",
					api: {
						port: 3000,
					},
				});

				expect(
					config.addSource("dev.json").addSource("base.json").build(),
				).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});
			});

			it("load .jsonc and .json5 files", () => {
				expect(config.addSource("base.jsonc").build()).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});

				expect(config.addSource("base.json5").build()).toEqual({
					appURL: "http://localhost:3000",
					api: {
						port: 3000,
					},
				});
			});

			it("should throw an error if the file does not exist", () => {
				try {
					config.addSource("not-exist.json").build();
				} catch (error) {
					const e = error as Error;
					expect(e.message).toEqual(
						expect.stringMatching(
							/File "[^"]+.not-exist.json" does not exist/g,
						),
					);
				}
			});
		});
	});

	it("should return the expected valued combining all addSource", () => {
		const config = new AppConfigBuilder(schema, {
			configFolder: "./src/__fixtures__",
		});

		const appUrlMockEnv = injectEnvVar("APP_appURL", "http://127.0.0:8080");

		const result = config
			.addSource("base.jsonc")
			.addSource("dev.json")
			.addSource("base.yml")
			.addSource(AppConfigBuilder.createEnvVarSource())
			.build();

		expect(result).toEqual({
			appURL: "http://127.0.0:8080",
			api: {
				port: 5959,
			},
		});

		appUrlMockEnv.clean();
	});

	it("should throw an error if pass an unsupported file", () => {
		try {
			config.addSource("base.config").build();
		} catch (error) {
			const e = error as Error;
			expect(e.message).toEqual(
				expect.stringMatching(/File type "base.config" not supported./g),
			);
		}
	});
});

function injectEnvVar(
	varName: string,
	value: unknown,
	runtime: Record<string, string | boolean | number | undefined> = process.env,
) {
	runtime[varName] = value as string;
	return {
		clean() {
			delete process.env[varName];
		},
	};
}
