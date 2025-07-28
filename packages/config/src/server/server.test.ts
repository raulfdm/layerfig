import { describe, expect, it } from "vitest";
import {
	ConfigBuilder,
	type ConfigBuilderOptions,
	ConfigParser,
	EnvironmentVariableSource,
	FileSource,
	ObjectSource,
	z,
} from "./index";

const Schema = z.object({
	appURL: z.url(),
	api: z.object({
		port: z.coerce.number().int().positive(),
	}),
});
type Schema = z.output<typeof Schema>;

const baseConfigBuilderOptions: ConfigBuilderOptions = {
	validate: (finalConfig) => {
		return Schema.parse(finalConfig);
	},
};

describe("ConfigBuilder", () => {
	it("should deep merge configuration", () => {
		const schema = z.object({
			foo: z.object({
				bar: z.object({
					zz: z.object({
						test: z.object({
							should_remain: z.string(),
							another: z.boolean(),
						}),
					}),
				}),
			}),
		});

		expect(
			getConfig({
				validate: (config) => schema.parse(config),
			})
				.addSource(new FileSource("base-deep.json"))
				.addSource(new FileSource("dev-deep.json"))
				.build(),
		).toEqual({
			foo: {
				bar: {
					zz: {
						test: {
							should_remain: "123",
							another: false,
						},
					},
				},
			},
		});
	});

	it("should throw an error if no source was added", () => {
		expect(() =>
			new ConfigBuilder(baseConfigBuilderOptions).build(),
		).toThrowErrorMatchingInlineSnapshot(
			"[Error: No source was added. Please provide one by using .addSource(<source>)]",
		);
	});

	it("should throw an error if the file does not exist", () => {
		try {
			getConfig().addSource(new FileSource("not-exist.json")).build();
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
				.addSource()
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

	it("should re-throw parser error", () => {
		const errorMessage = "This file is not valid";

		class MyParser extends ConfigParser {
			constructor() {
				super({ acceptedFileExtensions: ["json"] });
			}

			load() {
				return {
					ok: false,
					error: new Error(errorMessage),
				} as const;
			}
		}

		expect(() =>
			getConfig({
				parser: new MyParser(),
			})
				.addSource(new FileSource("base.json"))
				.build(),
		).toThrowErrorMatchingInlineSnapshot("[Error: This file is not valid]");
	});

	it("should throw an error if file type is not accepted", () => {
		expect(() =>
			getConfig().addSource(new FileSource("base.txt")).build(),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: ".txt" file is not supported by this parser. Accepted files are: "json"]`,
		);
	});

	it(`should provide a zod instance so I don't need to bring any external resource`, () => {
		const config = getConfig({
			validate: (finalConfig, z) => {
				const schemaInsideValidate = z.object({
					appURL: z.url(),
					api: z.object({
						port: z.coerce.number().check(z.int(), z.positive()),
					}),
				});

				return schemaInsideValidate.parse(finalConfig);
			},
		})
			.addSource(new FileSource("base.json"))
			.build();

		expect(config).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: 3000,
			},
		});
	});

	describe("from json", () => {
		it("should load .json files by default", () => {
			const result = getConfig().addSource(new FileSource("base.json")).build();

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
					.addSource(new FileSource("base.json"))
					.addSource(new FileSource("dev.json"))
					.build(),
			).toEqual({
				appURL: "https://dev.company-app.com",
				api: {
					port: 3000,
				},
			});

			expect(
				getConfig()
					.addSource(new FileSource("dev.json"))
					.addSource(new FileSource("base.json"))
					.build(),
			).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});
		});
	});

	describe("from object", () => {
		it("should load an object source", () => {
			const result = getConfig()
				.addSource(
					new ObjectSource<Schema>({
						appURL: "https://my-site.com",
						api: { port: 3000 },
					}),
				)
				.build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});
		});

		it("should merge object sources", () => {
			const result = getConfig()
				.addSource(new ObjectSource({ appURL: "https://my-site.com" }))
				.addSource(new ObjectSource({ api: { port: 4000 } }))
				.build();

			expect(result).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 4000,
				},
			});
		});

		it("should throw an error if the object is not valid", () => {
			expect(() =>
				getConfig()
					.addSource(new ObjectSource({ appURL: "not-a-url" }))
					.build(),
			).toThrowErrorMatchingInlineSnapshot(`
				[$ZodError: [
				  {
				    "code": "invalid_format",
				    "format": "url",
				    "path": [
				      "appURL"
				    ],
				    "message": "Invalid URL"
				  },
				  {
				    "expected": "object",
				    "code": "invalid_type",
				    "path": [
				      "api"
				    ],
				    "message": "Invalid input: expected object, received undefined"
				  }
				]]
			`);
		});
	});

	describe("from environment variable", () => {
		it("loads source from process.env by default", () => {
			process.env.APP_appURL = "https://my-site.com";
			process.env.APP_api__port = "3000";

			const result = getConfig()
				.addSource(new EnvironmentVariableSource())
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
				.addSource(new EnvironmentVariableSource())
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
					new EnvironmentVariableSource({
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

		it("should replace slots", () => {
			const result = new ConfigBuilder({
				validate: (finalConfig, z) => {
					const schema = z.object({
						appURL: z.url(),
						port: z.coerce.number().check(z.int(), z.positive()),
					});

					return schema.parse(finalConfig);
				},
				runtimeEnv: {
					APP_port: "$PORT",
					APP_appURL: "http://$HOST:$PORT",
					PORT: "3000",
					HOST: "localhost",
				},
			})
				.addSource(new EnvironmentVariableSource())
				.build();

			expect(result).toEqual({
				appURL: "http://localhost:3000",
				port: 3000,
			});
		});
	});

	describe("slots", () => {
		function getConfig(options?: Partial<ConfigBuilderOptions>) {
			const schema = z.object({
				appURL: z.url(),
				port: z.coerce.number().check(z.positive(), z.int()),
			});

			return new ConfigBuilder({
				validate: (finalConfig) => schema.parse(finalConfig),
				configFolder: "./src/__fixtures__",
				...options,
			});
		}

		it("should replace the slotted value with the value from env var", () => {
			process.env.PORT = "3000";

			expect(
				getConfig().addSource(new FileSource("slot.json")).build(),
			).toEqual({
				appURL: "http://localhost:3000",
				port: 3000,
			});

			delete process.env.PORT;
		});

		it("should NOT replace the slotted value if env var is not defined", () => {
			expect(
				getConfig({
					validate: (finalConfig) => finalConfig,
				})
					.addSource(new FileSource("slot.json"))
					.build(),
			).toEqual({
				appURL: "http://localhost:$PORT",
				port: "$PORT",
			});
		});

		it("should handle multiple slots", () => {
			process.env.PORT = "3000";
			process.env.HOST = "localhost";

			const schema = z.object({
				appURL: z.url(),
				port: z.coerce.number().check(z.positive(), z.int()),
				host: z.string(),
			});

			expect(
				getConfig({
					validate: (config) => schema.parse(config),
				})
					.addSource(new FileSource("slot-multiple.json"))
					.build(),
			).toEqual({
				appURL: "http://localhost:3000",
				port: 3000,
				host: "localhost",
			});

			delete process.env.PORT;
			delete process.env.HOST;
		});

		it("should accept custom slot prefix", () => {
			process.env.PORT = "3000";

			expect(
				getConfig({
					slotPrefix: "@",
				})
					.addSource(new FileSource("slot-prefix.json"))
					.build(),
			).toEqual({
				appURL: "http://localhost:3000",
				port: 3000,
			});

			delete process.env.PORT;
		});
	});
});

function getConfig(options?: Partial<ConfigBuilderOptions>) {
	const schema = z.object({
		appURL: z.url(),
		api: z.object({
			port: z.coerce.number().check(z.int(), z.positive()),
		}),
	});

	return new ConfigBuilder({
		validate: (finalConfig) => schema.parse(finalConfig),
		configFolder: "./src/__fixtures__",
		...options,
	});
}
