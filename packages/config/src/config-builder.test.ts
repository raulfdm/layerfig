import path from "node:path";
import { assertType, describe, expect, it, vi } from "vitest";
import * as ClientModule from "./client";
import { basicJsonParser } from "./parser/parser-json";
import * as ServerModule from "./server";
import { FileSource } from "./server";
import { EnvironmentVariableSource } from "./sources/env-var";
import { ObjectSource } from "./sources/object";
import { z } from "./zod";

const builders = [
	{ ConfigBuilder: ClientModule.ConfigBuilder, mode: "Client" },
	{
		ConfigBuilder: ServerModule.ConfigBuilder,
		mode: "Server",
	},
];

describe.each(builders)(
	"[Shared Features] ConfigBuilder ($mode)",
	({ ConfigBuilder }) => {
		describe("basic slot", () => {
			it("should replace basic slots", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				const config = new ConfigBuilder({
					validate: (finalConfig) => schema.parse(finalConfig),
					runtimeEnv: {
						PORT: "3000",
					},
				})
					.addSource(
						new ObjectSource({
							port: "$PORT",
							host: "localhost:$PORT",
						}),
					)
					.build();

				expect(config).toEqual({
					port: 3000,
					host: "localhost:3000",
				});
			});

			it("should replace basic slots with fallback", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				const config = new ConfigBuilder({
					validate: (finalConfig) => schema.parse(finalConfig),
				})
					.addSource(
						new ObjectSource({
							port: "${PORT:-3000}",
							host: "localhost:${PORT:-3000}",
						}),
					)
					.build();

				expect(config).toEqual({
					port: 3000,
					host: "localhost:3000",
				});
			});

			it("should not replace value if env var is undefined and console.warn", () => {
				const warnSpy = vi.spyOn(console, "warn");

				const schema = z.object({
					host: z.string(),
				});

				const config = new ConfigBuilder({
					validate: (finalConfig) => schema.parse(finalConfig),
				})
					.addSource(
						new ObjectSource({
							host: "localhost:$PORT",
						}),
					)
					.build();

				expect(config).toEqual({
					host: "localhost:$PORT",
				});

				expect(warnSpy).toHaveBeenCalledWith(
					"[SINGLE_VARIABLE_SLOT]",
					'The value for the slot "PORT" is not defined in the runtime environment. The slot will not be replaced.',
				);
			});
		});

		describe("multi variable slot", () => {
			it("should replace multi variable slots", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				const config = new ConfigBuilder({
					validate: (finalConfig) => schema.parse(finalConfig),
					runtimeEnv: {
						APP_PORT: "5432",
					},
				})
					.addSource(
						new ObjectSource({
							port: "${PORT:APP_PORT}",
							host: "localhost:${PORT:APP_PORT}",
						}),
					)
					.build();

				expect(config).toEqual({
					port: 5432,
					host: "localhost:5432",
				});
			});

			it("should use the first defined variable", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				const mockPort1 = "8080";
				const mockPort2 = "4321";
				const mockPort3 = "5723";

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {
							PORT_1: mockPort1,
							PORT_2: mockPort2,
							PORT_3: mockPort3,
						},
					})
						.addSource(
							new ObjectSource({
								port: "${PORT_1:PORT_2:PORT_3}",
								host: "localhost:${PORT_1:PORT_2:PORT_3}",
							}),
						)
						.build(),
				).toEqual({
					port: Number(mockPort1),
					host: `localhost:${mockPort1}`,
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {
							PORT_1: undefined,
							PORT_2: mockPort2,
							PORT_3: mockPort3,
						},
					})
						.addSource(
							new ObjectSource({
								port: "${PORT_1:PORT_2:PORT_3}",
								host: "localhost:${PORT_1:PORT_2:PORT_3}",
							}),
						)
						.build(),
				).toEqual({
					port: Number(mockPort2),
					host: `localhost:${mockPort2}`,
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {
							PORT_1: undefined,
							PORT_2: undefined,
							PORT_3: mockPort3,
						},
					})
						.addSource(
							new ObjectSource({
								port: "${PORT_1:PORT_2:PORT_3}",
								host: "localhost:${PORT_1:PORT_2:PORT_3}",
							}),
						)
						.build(),
				).toEqual({
					port: Number(mockPort3),
					host: `localhost:${mockPort3}`,
				});
			});

			it("should use fallback value if no env var is defined", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
					})
						.addSource(
							new ObjectSource({
								port: "${PORT_1:PORT_2:PORT_3:-3000}",
								host: "localhost:${PORT_1:PORT_2:PORT_3:-3000}",
							}),
						)
						.build(),
				).toEqual({
					port: 3000,
					host: "localhost:3000",
				});
			});

			it("should not replace value if env var is undefined and console.warn", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const schema = z.object({
					host: z.string(),
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
					})
						.addSource(
							new ObjectSource({
								host: "${PORT_1:PORT_2:PORT_3}",
							}),
						)
						.build(),
				).toEqual({
					host: "${PORT_1:PORT_2:PORT_3}",
				});

				expect(warnSpy).toHaveBeenCalledWith(
					"[MULTI_VARIABLE_SLOT]",
					'None of the variables \"PORT_1, PORT_2, PORT_3\" are defined in the runtime environment. The slot will not be replaced.',
				);
			});
		});

		describe("Self-referencing slot", () => {
			it("should replace the self-reference slot with the property value", () => {
				const schema = z.object({
					port: z.coerce.number().int().positive(),
					host: z.string(),
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {
							PORT: "3000",
						},
					})
						.addSource(
							new ObjectSource({
								host: "localhost:${self.port}",
								port: "$PORT",
							}),
						)
						.build(),
				).toEqual({
					host: "localhost:3000",
					port: 3000,
				});
			});

			it("should not replace self-reference if value is not defined and console.warn", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const schema = z.object({
					host: z.string(),
				});

				expect(
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {},
					})
						.addSource(
							new ObjectSource({
								host: "localhost:${self.port}",
							}),
						)
						.build(),
				).toEqual({
					host: "localhost:${self.port}",
				});

				expect(warnSpy).toHaveBeenCalledWith(
					"[SELF_REFERENCING_SLOT]",
					'Self-referencing slot (path \"port\") is not defined in the config object. The slot will not be replaced.',
				);
			});

			it("should throw error if path is not defined", () => {
				const schema = z.object({
					host: z.string(),
				});

				expect(() =>
					new ConfigBuilder({
						validate: (finalConfig) => schema.parse(finalConfig),
						runtimeEnv: {},
					})
						.addSource(
							new ObjectSource({
								host: "localhost:${self.}",
							}),
						)
						.build(),
				).toThrowErrorMatchingInlineSnapshot(
					`[Error: Invalid self-referencing slot pattern: "\${self.}". Object Path is missing.]`,
				);
			});
		});

		describe("ObjectSource", () => {
			it("should infer the type from the object", () => {
				const testObject = {
					foo: "bar",
					nested: {
						baz: "qux",
					},
				};

				type TestObject = typeof testObject;

				const envVarSource = new ObjectSource(testObject);

				assertType<TestObject>(
					envVarSource.loadSource({
						runtimeEnv: {},
						slotPrefix: "$",
					}),
				);
			});
		});

		describe("EnvironmentVariableSource", () => {
			it("should override values provided by environment variable", () => {
				const mockedEnvVarHost = "localhost:3000";

				const config = new ConfigBuilder({
					validate: (finalConfig) =>
						z.object({ host: z.string() }).parse(finalConfig),
					runtimeEnv: {
						PORT: "8080",
						APP_host: mockedEnvVarHost,
					},
				})
					.addSource(new EnvironmentVariableSource())
					.build();

				expect(config).toEqual({
					host: mockedEnvVarHost,
				});
			});

			it("should override nested values provided by environment variable", () => {
				const config = new ConfigBuilder({
					validate: (finalConfig) =>
						z
							.object({
								foo: z.object({
									bar: z.object({
										zz: z.stringbool(),
									}),
								}),
							})
							.parse(finalConfig),
					runtimeEnv: {
						APP_foo__bar__zz: "on",
					},
				})
					.addSource(new EnvironmentVariableSource())
					.build();

				expect(config).toEqual({
					foo: {
						bar: {
							zz: true,
						},
					},
				});
			});

			it("should customize separator, prefix and separatorPrefix", () => {
				const config = new ConfigBuilder({
					validate: (finalConfig) =>
						z
							.object({
								foo: z.object({
									bar: z.object({
										zz: z.stringbool(),
									}),
								}),
							})
							.parse(finalConfig),
					runtimeEnv: {
						"MY_APP-foo--bar--zz": "on",
					},
				})
					.addSource(
						new EnvironmentVariableSource({
							prefix: "MY_APP",
							prefixSeparator: "-",
							separator: "--",
						}),
					)
					.build();

				expect(config).toEqual({
					foo: {
						bar: {
							zz: true,
						},
					},
				});
			});

			it("should not replace anything if env var value is not defined", () => {
				expect(
					new ClientModule.ConfigBuilder({
						validate: (finalConfig) => finalConfig,
						runtimeEnv: {
							APP_FOOOO: undefined,
						},
					})
						.addSource(
							new ObjectSource({
								host: "$HOST",
							}),
						)
						.addSource(new EnvironmentVariableSource())
						.build(),
				).toEqual({
					host: "$HOST",
				});
			});

			it("should throw and error if no source was added", () => {
				expect(() => {
					new ConfigBuilder({
						validate: (finalConfig, z) =>
							z
								.object({
									host: z.string(),
								})
								.parse(finalConfig),
						runtimeEnv: {},
					}).build();
				}).toThrowErrorMatchingInlineSnapshot(
					"[Error: No source was added. Please provide one by using .addSource(<source>)]",
				);
			});
		});
	},
);

describe("[CLIENT] ConfigBuilder", () => {
	it("should not accept any other source rather than EnvironmentVariableSource and ObjectSource", () => {
		expect(() => {
			new ClientModule.ConfigBuilder({
				validate: (finalConfig, z) =>
					z
						.object({
							host: z.string(),
						})
						.parse(finalConfig),
				runtimeEnv: {},
			})
				.addSource(
					// @ts-expect-error - Forcing error
					new FileSource("foo"),
				)
				.build();
		}).toThrowErrorMatchingInlineSnapshot(
			"[Error: ✖ Invalid source. Client ConfigBuilder only Accepts ObjectSource or EnvironmentVariableSource]",
		);
	});
});

describe("[SERVER] ConfigBuilder", () => {
	const basicConfigOptions: ServerModule.ConfigBuilderOptions = {
		absoluteConfigFolderPath: path.resolve(process.cwd(), "src/__fixtures__"),
		parser: basicJsonParser,
		runtimeEnv: process.env,
		slotPrefix: "$",
		validate: (finalConfig, z) =>
			z
				.object({
					appURL: z.url(),
					api: z.object({
						port: z.coerce.number(),
					}),
				})
				.parse(finalConfig),
	};

	it("should throw an error if user pass an invalid source", () => {
		class RandomSource {}
		expect(() => {
			new ServerModule.ConfigBuilder(basicConfigOptions)
				// @ts-expect-error - Invalid source. Server ConfigBuilder only Accepts FileSource or EnvironmentVariableSource
				.addSource(new RandomSource())
				.build();
		}).toThrowErrorMatchingInlineSnapshot(
			"[Error: Invalid source. Please provide a valid one (EnvironmentVariableSource, FileSource, or ObjectSource)]",
		);
	});

	describe("FileSource", () => {
		it("should load from file source", () => {
			const config = new ServerModule.ConfigBuilder(basicConfigOptions)
				.addSource(new ServerModule.FileSource("base.json"))
				.build();

			expect(config).toEqual({
				appURL: "https://my-site.com",
				api: {
					port: 3000,
				},
			});
		});

		it("should throw an error if absoluteConfigFolderPath is not absolute", () => {
			expect(() =>
				new ServerModule.ConfigBuilder({
					...basicConfigOptions,
					absoluteConfigFolderPath: "./src/__fixtures__",
				})
					.addSource(new ServerModule.FileSource("base.json"))
					.build(),
			).toThrowErrorMatchingInlineSnapshot(`
				[$ZodError: [
				  {
				    "code": "custom",
				    "path": [
				      "absoluteConfigFolderPath"
				    ],
				    "message": "Path must be absolute"
				  }
				]]
			`);
		});

		it("should throw an error if try to load an invalid file extension", () => {
			expect(() => {
				new ServerModule.ConfigBuilder(basicConfigOptions)
					.addSource(new ServerModule.FileSource("base.txt"))
					.build();
			}).toThrowErrorMatchingInlineSnapshot(
				`[Error: ".txt" file is not supported by this parser. Accepted files are: "json"]`,
			);
		});

		it("should throw an error if try to load a file that does not exist", () => {
			try {
				new ServerModule.ConfigBuilder(basicConfigOptions)
					.addSource(new ServerModule.FileSource("nonexistent.json"))
					.build();
			} catch (e) {
				expect((e as Error).message).toStrictEqual(
					expect.stringContaining(
						'src/__fixtures__/nonexistent.json" does not exist',
					),
				);
			}
		});

		it("should throw the parser load error if something went wrong", () => {
			expect(() => {
				new ServerModule.ConfigBuilder(basicConfigOptions)
					.addSource(new ServerModule.FileSource("invalid.json"))
					.build();
			}).toThrowErrorMatchingInlineSnapshot(
				"[SyntaxError: Unexpected end of JSON input]",
			);
		});
	});
});
