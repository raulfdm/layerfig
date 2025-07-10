import { assertType, describe, expect, it } from "vitest";
import { basicJsonParser } from "../parser/parser-json";
import { ObjectSource } from "./object";
import type { LoadSourceOptions } from "./source";

const baseLoadSourceOptions: LoadSourceOptions = {
	relativeConfigFolderPath: "./src/__fixtures__",
	parser: basicJsonParser,
	runtimeEnv: process.env,
	slotPrefix: "$",
};

describe("ObjectSource", () => {
	it("should return the same object", () => {
		const testObject = {
			foo: "bar",
			nested: {
				baz: "qux",
			},
		};

		const envVarSource = new ObjectSource(testObject);

		expect(envVarSource.loadSource(baseLoadSourceOptions)).toEqual(testObject);
	});

	it("should infer the type from the object", () => {
		const testObject = {
			foo: "bar",
			nested: {
				baz: "qux",
			},
		};

		type TestObject = typeof testObject;

		const envVarSource = new ObjectSource(testObject);

		assertType<TestObject>(envVarSource.loadSource(baseLoadSourceOptions));
	});

	describe("slots", () => {
		it("should replace slot value", () => {
			const testObject = {
				port: "$PORT",
				useTLS: true,
			};

			const envVarSource = new ObjectSource(testObject);

			expect(
				envVarSource.loadSource({
					...baseLoadSourceOptions,
					runtimeEnv: {
						PORT: "3000",
					},
				}),
			).toEqual({
				port: "3000",
				useTLS: true,
			});
		});

		it("should replace values with multiple values", () => {
			const testObject = {
				port: "$PORT",
				appURL: "http://$HOST:$PORT",
				useTLS: true,
				host: "$HOST",
			};

			const envVarSource = new ObjectSource(testObject);

			expect(
				envVarSource.loadSource({
					...baseLoadSourceOptions,
					runtimeEnv: {
						PORT: "3000",
						HOST: "localhost",
					},
				}),
			).toEqual({
				port: "3000",
				appURL: "http://localhost:3000",
				useTLS: true,
				host: "localhost",
			});
		});
	});
});
