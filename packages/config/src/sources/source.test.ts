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
});
