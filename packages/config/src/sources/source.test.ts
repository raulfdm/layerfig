/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: This is intentional */
import { describe, expect, it, vi } from "vitest";

import { Source } from "./source";

class MyCustomSource extends Source {
	loadSource() {
		// Custom implementation for loading the source
		return {};
	}
}

describe("Source", () => {
	it("should be instantiable", () => {
		const source = new MyCustomSource();
		expect(source).toBeInstanceOf(MyCustomSource);
	});

	describe(".maybeReplaceSlots", () => {
		it("should resolve all cases altogether", () => {
			const source = new MyCustomSource();

			const initial = {
				port: "$PORT",
				host: "localhost:${self.port}",

				fallBack: "${FALLBACK:-random fallback value}",
				nested: {
					deep: {
						fullName: "${FIRST_NAME} ${SECOND_NAME}",
					},
				},
				selfReference: "${self.nested.deep.fullName}",
			};

			const valueString = source.maybeReplaceSlots({
				slotPrefix: "$",
				contentString: JSON.stringify(initial),
				runtimeEnv: {
					PORT: "3000",
					FIRST_NAME: "John",
					SECOND_NAME: "Doe",
				},
				transform: (content) => JSON.parse(content),
			});

			expect(valueString).toEqual({
				port: "3000",
				host: "localhost:3000",
				nested: {
					deep: {
						fullName: "John Doe",
					},
				},
				fallBack: "random fallback value",
				selfReference: "John Doe",
			});
		});

		describe("single variable slot", () => {
			it("should replace the slot", () => {
				const source = new MyCustomSource();

				const mockedName = "John Doe";
				const json = {
					name: "$NAME",
				};

				const value = source.maybeReplaceSlots({
					contentString: JSON.stringify(json),
					runtimeEnv: {
						NAME: mockedName,
					},
					slotPrefix: "$",
					transform: (content) => JSON.parse(content),
				});

				expect(value).toEqual({ name: mockedName });
			});

			it("should replace all slot encounters", () => {
				const source = new MyCustomSource();

				const mockedPort = "8080";
				const json = {
					port: "$PORT",
					baseURL: "http://localhost:$PORT",
				};

				const value = source.maybeReplaceSlots({
					contentString: JSON.stringify(json),
					runtimeEnv: {
						PORT: mockedPort,
					},
					slotPrefix: "$",
					transform: (content) => JSON.parse(content),
				});

				expect(value).toEqual({
					port: mockedPort,
					baseURL: `http://localhost:${mockedPort}`,
				});
			});

			it("should consider different slot prefix", () => {
				const source = new MyCustomSource();

				const mockedPort = "8080";
				const json = {
					port: "@PORT",
					baseURL: "http://localhost:@PORT",
				};

				const value = source.maybeReplaceSlots({
					contentString: JSON.stringify(json),
					runtimeEnv: {
						PORT: mockedPort,
					},
					slotPrefix: "@",
					transform: (content) => JSON.parse(content),
				});

				expect(value).toEqual({
					port: mockedPort,
					baseURL: `http://localhost:${mockedPort}`,
				});
			});

			it("should use fallback value if not found", () => {
				const source = new MyCustomSource();

				const json = {
					name: "${NAME:-Joana Doe}",
				};

				const value = source.maybeReplaceSlots({
					contentString: JSON.stringify(json),
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => JSON.parse(content),
				});

				expect(value).toEqual({ name: "Joana Doe" });
			});

			it("should return the same value if no slot match was found and log it", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlots({
					contentString: "$NAME",
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => content,
				});

				expect(value).toBe("$NAME");
				expect(warnSpy).toHaveBeenCalledWith(
					"[SINGLE_VARIABLE_SLOT]",
					'The value for the slot "NAME" is not defined in the runtime environment. The slot will not be replaced.',
				);
			});
		});

		describe("multi variable", () => {
			it("should always fill with the first defined value", () => {
				const source = new MyCustomSource();

				const mockedName1 = "John Doe";
				const mockedName2 = "Jane Doe";
				const mockedName3 = "Jack Doe";

				expect(
					source.maybeReplaceSlots({
						contentString: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: mockedName1,
							NAME2: mockedName2,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
						transform: (content) => content,
					}),
				).toBe(mockedName1);

				expect(
					source.maybeReplaceSlots({
						contentString: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: undefined,
							NAME2: mockedName2,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
						transform: (content) => content as never,
					}),
				).toBe(mockedName2);

				expect(
					source.maybeReplaceSlots({
						contentString: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: undefined,
							NAME2: undefined,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
						transform: (content) => content as never,
					}),
				).toBe(mockedName3);
			});

			it("should return the same value if no variable was found", () => {
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlots({
					contentString: "${NAME1:NAME2:NAME3}",
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => content as never,
				});

				expect(value).toBe("${NAME1:NAME2:NAME3}");
			});

			it("should return the fallback value if no env var is found", () => {
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlots({
					contentString: "${NAME1:NAME2:NAME3:-fallback value}",
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => content as never,
				});

				expect(value).toBe("fallback value");
			});

			it("should not accept invalid fallback syntax", () => {
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlots({
					contentString: "${NAME1:NAME2:NAME3:=fallback value}",
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => content as never,
				});

				expect(value).toBe("${NAME1:NAME2:NAME3:=fallback value}");
			});

			it("should return the same value if no slot match was found and log it", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlots({
					contentString: "${NAME:NAME2:NAME3}",
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => content,
				});

				expect(value).toBe("${NAME:NAME2:NAME3}");
				expect(warnSpy).toHaveBeenCalledWith(
					"[MULTI_VARIABLE_SLOT]",
					'None of the variables "NAME, NAME2, NAME3" are defined in the runtime environment. The slot will not be replaced.',
				);
			});
		});

		describe("self-referenced", () => {
			it("should replace slot with the property value", () => {
				const initial = {
					port: "$PORT",
					host: "localhost:${self.port}",
				};

				const source = new MyCustomSource();

				const valueString = source.maybeReplaceSlots({
					slotPrefix: "$",
					contentString: JSON.stringify(initial),
					runtimeEnv: {
						PORT: "3000",
					},
					transform: (content) => JSON.parse(content),
				});

				expect(valueString).toEqual({ port: "3000", host: "localhost:3000" });
			});

			it("should replace slot with the deep property value", () => {
				const initial = {
					deep: {
						foo: "true",
						another: {
							port: "$PORT",
							host: "localhost:${self.deep.another.port}",
							bar: "${self.deep.foo}",
						},
					},
				};

				const source = new MyCustomSource();

				const valueString = source.maybeReplaceSlots({
					slotPrefix: "$",
					contentString: JSON.stringify(initial),
					runtimeEnv: {
						PORT: "3000",
					},
					transform: (content) => JSON.parse(content),
				});

				expect(valueString).toEqual({
					deep: {
						foo: "true",
						another: {
							port: "3000",
							host: "localhost:3000",
							bar: "true",
						},
					},
				});
			});

			it("should not replace if value is not found and log it", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const source = new MyCustomSource();

				const json = {
					value: {},
					notFound: "${self.value.someProperty}",
				};

				const value = source.maybeReplaceSlots({
					contentString: JSON.stringify(json),
					runtimeEnv: {},
					slotPrefix: "$",
					transform: (content) => JSON.parse(content),
				});

				expect(value).toEqual(json);
				expect(warnSpy).toHaveBeenCalledWith(
					"[SELF_REFERENCING_SLOT]",
					`Self-referencing slot (path "value.someProperty") is not defined in the config object. The slot will not be replaced.`,
				);
			});

			it("throw an error if path is not found", () => {
				const source = new MyCustomSource();

				expect(() =>
					source.maybeReplaceSlots({
						contentString: "${self.}",
						runtimeEnv: {},
						slotPrefix: "$",
						transform: (content) => content,
					}),
				).toThrow(
					'Invalid self-referencing slot pattern: "${self.}". Object Path is missing.',
				);
			});
		});
	});
});
