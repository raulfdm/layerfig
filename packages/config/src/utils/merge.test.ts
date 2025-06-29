import { describe, expect, it, vi } from "vitest";

import { merge } from "./merge";

describe("merge function", () => {
	describe("basic functionality", () => {
		it("should merge two simple objects", () => {
			const target = { a: 1, b: 2 };
			const source = { c: 3, d: 4 };
			const result = merge(target, source);

			expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
			expect(result).toBe(target); // Should mutate target
		});

		it("should overwrite primitive values", () => {
			const target = { a: 1, b: 2 };
			const source = { b: 3, c: 4 };
			const result = merge(target, source);

			expect(result).toEqual({ a: 1, b: 3, c: 4 });
		});

		it("should return target when no sources provided", () => {
			const target = { a: 1, b: 2 };
			const result = merge(target);

			expect(result).toEqual({ a: 1, b: 2 });
			expect(result).toBe(target);
		});
	});

	describe("deep merging", () => {
		it("should deep merge nested objects", () => {
			const target = {
				user: {
					name: "John",
					age: 30,
					profile: {
						bio: "Developer",
					},
				},
			};

			const source = {
				user: {
					email: "john@example.com",
					profile: {
						avatar: "avatar.jpg",
					},
				},
			};

			const result = merge(target, source);

			expect(result).toEqual({
				user: {
					name: "John",
					age: 30,
					email: "john@example.com",
					profile: {
						bio: "Developer",
						avatar: "avatar.jpg",
					},
				},
			});
		});

		it("should create nested objects when target property is undefined", () => {
			const target = { a: 1 };
			const source = { b: { c: { d: 2 } } };
			const result = merge(target, source);

			expect(result).toEqual({
				a: 1,
				b: { c: { d: 2 } },
			});
		});

		it("should replace non-object values with objects when merging", () => {
			const target = { a: "string" };
			const source = { a: { b: 1 } };
			const result = merge(target, source);

			expect(result).toEqual({ a: { b: 1 } });
		});
	});

	describe("multiple sources", () => {
		it("should merge multiple sources in order", () => {
			const target = { a: 1 };
			const source1 = { b: 2 };
			const source2 = { c: 3 };
			const source3 = { d: 4 };

			const result = merge(target, source1, source2, source3);

			expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
		});

		it("should apply later sources over earlier ones", () => {
			const target = { a: 1 };
			const source1 = { a: 2, b: 2 };
			const source2 = { a: 3, c: 3 };

			const result = merge(target, source1, source2);

			expect(result).toEqual({ a: 3, b: 2, c: 3 });
		});

		it("should deep merge with multiple sources", () => {
			const target = { user: { name: "John" } };
			const source1 = { user: { age: 30 } };
			const source2 = { user: { email: "john@example.com" } };

			const result = merge(target, source1, source2);

			expect(result).toEqual({
				user: {
					name: "John",
					age: 30,
					email: "john@example.com",
				},
			});
		});
	});

	describe("edge cases", () => {
		it("should handle empty objects", () => {
			const target = {};
			const source = { a: 1 };
			const result = merge(target, source);

			expect(result).toEqual({ a: 1 });
		});

		it("should handle null and undefined sources", () => {
			const target = { a: 1 };
			// @ts-expect-error - Testing behavior with null and undefined
			const result = merge(target, null, undefined);

			expect(result).toEqual({ a: 1 });
		});

		it("should handle arrays (should not merge array elements)", () => {
			const target = { arr: [1, 2] };
			const source = { arr: [3, 4] };
			const result = merge(target, source);

			expect(result).toEqual({ arr: [3, 4] });
		});

		it("should handle dates", () => {
			vi.useFakeTimers();

			const date1 = new Date("2023-01-01");
			const date2 = new Date("2023-02-01");
			const target = { date: date1 };
			const source = { date: date2 };

			const result = merge(target, source);

			expect(result.date).toBe(date2);
		});

		it("should handle functions", () => {
			const fn1 = () => "target";
			const fn2 = () => "source";
			const target = { fn: fn1 };
			const source = { fn: fn2 };

			const result = merge(target, source);

			expect(result.fn).toBe(fn2);
		});
	});
});
