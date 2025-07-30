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

	describe(".maybeReplaceSlotFromValue", () => {
		it("should not replace self-reference values", () => {
			const source = new MyCustomSource();

			const content = `myValue: $\{self.foo.bar\}
port: $PORT`;

			expect(
				source.maybeReplaceSlotFromValue({
					value: content,
					runtimeEnv: {
						PORT: "8080",
					},
					slotPrefix: "$",
				}),
			).toMatchInlineSnapshot(`
				"myValue: \${self.foo.bar}
				port: 8080"
			`);
		});

		describe("basic slot $SLOT", () => {
			it("should replace the slot", () => {
				const source = new MyCustomSource();

				const mockedName = "John Doe";

				const value = source.maybeReplaceSlotFromValue({
					value: "$NAME",
					runtimeEnv: {
						NAME: mockedName,
					},
					slotPrefix: "$",
				});

				expect(value).toBe(mockedName);
			});

			it("should replace multiple slots", () => {
				const source = new MyCustomSource();

				const mockedName = "John Doe";
				const mockedPort = "8080";
				const mockedBranch = "dev";

				const value = `name: $NAME
port: $PORT
branch: $\{GIT_BRANCH:GIT_REF:-main\}
baseBranch: $\{GIT_REF:-next\}`;

				const expectedValue = `name: ${mockedName}
port: ${mockedPort}
branch: ${mockedBranch}
baseBranch: next`;

				const content = source.maybeReplaceSlotFromValue({
					value,
					runtimeEnv: {
						NAME: mockedName,
						PORT: mockedPort,
						GIT_BRANCH: mockedBranch,
					},
					slotPrefix: "$",
				});

				expect(content).toBe(expectedValue);
			});

			it("should consider different slot prefix", () => {
				const source = new MyCustomSource();

				const mockedName = "John Doe";

				const value = source.maybeReplaceSlotFromValue({
					value: "@NAME",
					runtimeEnv: {
						NAME: mockedName,
					},
					slotPrefix: "@",
				});

				expect(value).toBe(mockedName);
			});

			it("should return the same value if no slot match was found and log it", () => {
				const source = new MyCustomSource();

				const mockedName = "John Doe";

				const value = source.maybeReplaceSlotFromValue({
					value: "@NAME",
					runtimeEnv: {
						NAME: mockedName,
					},
					slotPrefix: "$",
				});

				expect(value).toBe("@NAME");
			});

			it("should return the same value and log if slot value is not defined", () => {
				const warnSpy = vi.spyOn(console, "warn");
				const source = new MyCustomSource();

				const value = source.maybeReplaceSlotFromValue({
					value: "$NAME",
					runtimeEnv: {},
					slotPrefix: "$",
				});

				expect(value).toBe("$NAME");

				expect(warnSpy).toHaveBeenCalledWith(
					"[SLOT_REPLACEMENT]",
					'The value for the slot "NAME" is not defined in the runtime environment. The slot will not be replaced.',
				);
			});
		});

		describe("multi value ${SLOT1:SLOT2}", () => {
			it("should check all env var names and fill the first encounter", () => {
				const source = new MyCustomSource();

				const mockedName1 = "John Doe";
				const mockedName2 = "Jane Doe";
				const mockedName3 = "Jack Doe";

				expect(
					source.maybeReplaceSlotFromValue({
						value: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: mockedName1,
							NAME2: mockedName2,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
					}),
				).toBe(mockedName1);

				expect(
					source.maybeReplaceSlotFromValue({
						value: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: undefined,
							NAME2: mockedName2,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
					}),
				).toBe(mockedName2);

				expect(
					source.maybeReplaceSlotFromValue({
						value: "${NAME1:NAME2:NAME3}",
						runtimeEnv: {
							NAME1: undefined,
							NAME2: undefined,
							NAME3: mockedName3,
						},
						slotPrefix: "$",
					}),
				).toBe(mockedName3);
			});

			it("should use fallback value", () => {
				const source = new MyCustomSource();

				const mockedFallbackValue = "Nolan";

				expect(
					source.maybeReplaceSlotFromValue({
						value: `\${NAME1:NAME2:NAME3:-${mockedFallbackValue}}`,
						runtimeEnv: {},
						slotPrefix: "$",
					}),
				).toBe(mockedFallbackValue);
			});

			it("should not consider other characters for fallback", () => {
				const source = new MyCustomSource();

				const mockedFallbackValue = "Nolan";
				let mockedValue = `\${NAME1:NAME2:NAME3:=${mockedFallbackValue}}`;

				expect(
					source.maybeReplaceSlotFromValue({
						value: mockedValue,
						runtimeEnv: {},
						slotPrefix: "$",
					}),
				).toBe(mockedValue);

				mockedValue = `\${NAME1:NAME2:NAME3:+${mockedFallbackValue}}`;

				expect(
					source.maybeReplaceSlotFromValue({
						value: mockedValue,
						runtimeEnv: {},
						slotPrefix: "$",
					}),
				).toBe(mockedValue);
			});
		});
	});

	describe(".maybeReplaceSelfReferenceValue", () => {
		it("should return value from the self-reference path", () => {
			const source = new MyCustomSource();

			const value = source.maybeReplaceSelfReferenceValue({
				value: "${self.foo.bar}",
				slotPrefix: "$",
				partialConfig: {
					foo: {
						bar: "baz",
					},
				},
			});

			expect(value).toBe("baz");
		});

		it.only("should consider multiple self-references", () => {
			const source = new MyCustomSource();

			const value = source.maybeReplaceSelfReferenceValue({
				value: "${self.foo.bar} and ${self.foo.baz}",
				slotPrefix: "$",
				partialConfig: {
					foo: {
						bar: "baz",
						baz: "qux",
					},
				},
			});

			expect(value).toBe("baz and qux");
		});

		it("should return the same value if not a self-reference match", () => {
			const source = new MyCustomSource();

			const value = source.maybeReplaceSelfReferenceValue({
				value: "${it.foo.bar}",
				slotPrefix: "$",
				partialConfig: {
					foo: {
						bar: "baz",
					},
				},
			});

			expect(value).toBe("${it.foo.bar}");
		});

		it("should return undefined value from the self-reference path when not present", () => {
			const source = new MyCustomSource();

			const value = source.maybeReplaceSelfReferenceValue({
				value: "${self.foo.bar}",
				slotPrefix: "$",
				partialConfig: {
					foo: {},
				},
			});

			expect(value).toBe(undefined);
		});

		it("should consider different slotPrefix", () => {
			const source = new MyCustomSource();

			const value = source.maybeReplaceSelfReferenceValue({
				value: "#{self.foo.bar}",
				slotPrefix: "#",
				partialConfig: {
					foo: {
						bar: 1,
					},
				},
			});

			expect(value).toBe(1);
		});
	});
});
