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
});
