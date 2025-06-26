import { beforeEach, describe, expect, it } from "vitest";

import { set } from "./set";

describe("set function", () => {
	let testObject: Record<string, any>;

	beforeEach(() => {
		testObject = {};
	});

	describe("basic functionality", () => {
		it("should set a simple property", () => {
			const result = set(testObject, "name", "John");

			expect(result.name).toBe("John");
			expect(result).toBe(testObject); // Should mutate original object
		});

		it("should set nested properties with dot notation", () => {
			const result = set(testObject, "user.name", "John");

			expect(result).toEqual({
				user: { name: "John" },
			});
		});

		it("should set deeply nested properties", () => {
			const result = set(testObject, "user.profile.personal.name", "John");

			expect(result).toEqual({
				user: {
					profile: {
						personal: {
							name: "John",
						},
					},
				},
			});
		});
	});

	describe("array path notation", () => {
		it("should accept array paths", () => {
			const result = set(testObject, ["user", "name"], "John");

			expect(result).toEqual({
				user: { name: "John" },
			});
		});

		it("should handle mixed string and number keys in array paths", () => {
			const result = set(testObject, ["users", 0, "name"], "John");

			expect(result).toEqual({
				users: { 0: { name: "John" } },
			});
		});
	});

	describe("overwriting existing values", () => {
		it("should overwrite existing primitive values", () => {
			testObject.name = "Jane";
			const result = set(testObject, "name", "John");

			expect(result.name).toBe("John");
		});

		it("should overwrite existing nested values", () => {
			testObject.user = { name: "Jane", age: 25 };
			const result = set(testObject, "user.name", "John");

			expect(result).toEqual({
				user: { name: "John", age: 25 },
			});
		});

		it("should create nested structure even when intermediate value exists as primitive", () => {
			testObject.user = "some string";
			const result = set(testObject, "user.name", "John");

			expect(result).toEqual({
				user: { name: "John" },
			});
		});
	});

	describe("complex scenarios", () => {
		it("should handle setting multiple nested paths", () => {
			set(testObject, "user.name", "John");
			set(testObject, "user.age", 30);
			set(testObject, "user.profile.bio", "Developer");
			set(testObject, "settings.theme", "dark");

			expect(testObject).toEqual({
				user: {
					name: "John",
					age: 30,
					profile: {
						bio: "Developer",
					},
				},
				settings: {
					theme: "dark",
				},
			});
		});

		it("should handle numeric string keys", () => {
			const result = set(testObject, "items.0.name", "First Item");

			expect(result).toEqual({
				items: {
					"0": { name: "First Item" },
				},
			});
		});

		it("should work with existing nested objects", () => {
			testObject.user = {
				name: "Jane",
				profile: {
					bio: "Designer",
				},
			};

			const result = set(testObject, "user.profile.avatar", "avatar.jpg");

			expect(result).toEqual({
				user: {
					name: "Jane",
					profile: {
						bio: "Designer",
						avatar: "avatar.jpg",
					},
				},
			});
		});
	});

	describe("edge cases", () => {
		it("should handle empty string path", () => {
			const result = set(testObject, "", "value");
			expect(result).toEqual(testObject);
		});

		it("should handle single key path", () => {
			const result = set(testObject, "key", "value");
			expect(result.key).toBe("value");
		});

		it("should handle paths with empty segments", () => {
			const result = set(testObject, "a..b", "value");
			expect(result).toEqual({ a: { b: "value" } });
		});

		it("should set null and undefined values", () => {
			set(testObject, "nullValue", null);
			set(testObject, "undefinedValue", undefined);

			expect(testObject.nullValue).toBeNull();
			expect(testObject.undefinedValue).toBeUndefined();
		});

		it("should handle setting objects and arrays", () => {
			const objectValue = { nested: "value" };
			const arrayValue = [1, 2, 3];

			set(testObject, "objectProp", objectValue);
			set(testObject, "arrayProp", arrayValue);

			expect(testObject.objectProp).toBe(objectValue);
			expect(testObject.arrayProp).toBe(arrayValue);
		});
	});

	describe("return value", () => {
		it("should return the same object reference", () => {
			const original = { existing: "value" };
			const result = set(original, "new", "value");

			expect(result).toBe(original);
			expect(result).toEqual({
				existing: "value",
				new: "value",
			});
		});
	});
});
