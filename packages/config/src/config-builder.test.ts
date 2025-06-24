import Joi from "joi";
import * as v from "valibot";
import { assertType, describe, expect, it } from "vitest";
import * as yup from "yup";
import { z as z3 } from "zod";
import { z as z4 } from "zod/v4";

import { ConfigBuilder } from "./config-builder";
import { defineConfigParser } from "./parser/define-config-parser";

describe("ConfigBuilder", () => {
	const schema = z3.object({
		appURL: z3.string(),
		api: z3.object({
			port: z3
				.string()
				.transform((val) => Number.parseInt(val, 10))
				.or(z3.number()),
		}),
	});

	const config = new ConfigBuilder({
		validate: (config) => schema.parse(config),
		configFolder: "./src/__fixtures__",
	});

	describe("from environment variable", () => {
		it("loads source from process.env", () => {
			const appUrlMockEnv = injectEnvVar("APP_appURL", "https://my-site.com");
			const apiPortMockEnv = injectEnvVar("APP_api__port", "3000");

			const result = config
				.addSource(ConfigBuilder.createEnvVarSource())
				.build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});

			appUrlMockEnv.clean();
			apiPortMockEnv.clean();
		});

		it("loads source from a different runtime", () => {
			const runtimeEnv = import.meta.env as Record<string, string | undefined>;

			const appUrlMockEnv = injectEnvVar(
				"APP_appURL",
				"http://localhost:4422",
				runtimeEnv,
			);
			const apiPortMockEnv = injectEnvVar("APP_api__port", "4422", runtimeEnv);

			const result = config
				.addSource(
					ConfigBuilder.createEnvVarSource({
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
			const appUrlMockEnv = injectEnvVar("TEST-appURL", "https://my-site.com");
			const apiPortMockEnv = injectEnvVar("TEST-api_-_port", "5000");

			const result = config
				.addSource(
					ConfigBuilder.createEnvVarSource({
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

			appUrlMockEnv.clean();
			apiPortMockEnv.clean();
		});
	});

	describe("from json", () => {
		it("should add configuration from json file", () => {
			const result = config.addSource("base.json").build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
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
				appURL: "https://my-site.com",
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
					expect.stringMatching(/File "[^"]+.not-exist.json" does not exist/g),
				);
			}
		});
	});

	it("should throw error if not valid source", () => {
		expect(() =>
			config
				// @ts-expect-error - forcing error to test
				.addSource()
				.build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: Invalid source. Please provide a valid one.]",
		);
	});

	it("should re-throw parser error", () => {
		const errorMessage = "This file is not valid";

		const config = new ConfigBuilder({
			validate: (config) => schema.parse(config),
			configFolder: "./src/__fixtures__",
			parser: defineConfigParser({
				acceptedFileExtensions: ["json"],
				parse() {
					return {
						ok: false,
						error: new Error(errorMessage),
					};
				},
			}),
		});

		expect(() =>
			config.addSource("base.json").build(),
		).toThrowErrorMatchingInlineSnapshot("[Error: This file is not valid]");
	});

	it("should throw an error if file type is not accepted", () => {
		expect(() =>
			config.addSource("base.txt").build(),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: ".txt" file is not supported by this parser. Accepted files are: "json"]`,
		);
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

describe("Type-safe agnostic validate", () => {
	it("zod 3", () => {
		const schema = z3.object({
			appURL: z3.string().url(),
			api: z3.object({
				port: z3
					.string()
					.transform((val) => Number.parseInt(val, 10))
					.or(z3.number()),
			}),
		});

		const config = new ConfigBuilder({
			validate: (config) => schema.parse(config),
			configFolder: "./src/__fixtures__",
		})
			.addSource("base.json")
			.build();

		assertType<z3.infer<typeof schema>>(config);
		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("zod 4", () => {
		const schema = z4.object({
			appURL: z4.url(),
			api: z4.object({
				port: z4
					.string()
					.transform((val) => Number.parseInt(val, 10))
					.or(z4.number()),
			}),
		});

		const config = new ConfigBuilder({
			validate: (config) => schema.parse(config),
			configFolder: "./src/__fixtures__",
		})
			.addSource("base.json")
			.build();

		assertType<z4.infer<typeof schema>>(config);
		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("valibot", () => {
		const schema = v.object({
			appURL: v.pipe(v.string(), v.url()),
			api: v.object({
				port: v.union([
					v.pipe(
						v.string(),
						v.transform((val) => Number.parseInt(val, 10)),
					),
					v.number(),
				]),
			}),
		});

		const config = new ConfigBuilder({
			validate: (config) => v.parse(schema, config),
			configFolder: "./src/__fixtures__",
		})
			.addSource("base.json")
			.build();

		assertType<v.InferInput<typeof schema>>(config);

		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("joi", () => {
		interface SchemaType {
			appURL: string;
			api: {
				port: number;
			};
		}

		const schema = Joi.object<SchemaType>({
			appURL: Joi.string().uri(),
			api: Joi.object({
				port: Joi.alternatives().try(
					Joi.string().custom((value) => Number.parseInt(value, 10)),
					Joi.number(),
				),
			}),
		});

		const config = new ConfigBuilder({
			validate: (config) => {
				const result = schema.validate(config);

				if (result.error) {
					throw new Error(`Validation failed: ${result.error.message}`);
				}

				return result.value;
			},
			configFolder: "./src/__fixtures__",
		})
			.addSource("base.json")
			.build();

		assertType<SchemaType>(config);

		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	it("yup", () => {
		const schema = yup.object({
			appURL: yup.string().url().required(),
			api: yup
				.object({
					port: yup
						.mixed()
						.transform((value) => {
							if (typeof value === "string") {
								return Number.parseInt(value, 10);
							}
							return value;
						})
						.test(
							"is-number",
							"Must be a number",
							(value) => typeof value === "number" && !Number.isNaN(value),
						)
						.required(),
				})
				.required(),
		});

		const config = new ConfigBuilder({
			validate: (config) => {
				return schema.validateSync(config);
			},
			configFolder: "./src/__fixtures__",
		})
			.addSource("base.json")
			.build();

		assertType<yup.InferType<typeof schema>>(config);

		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});
});
