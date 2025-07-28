import { describe, expect, it, vi } from "vitest";
import {
	ConfigBuilder,
	EnvironmentVariableSource,
	ObjectSource,
	z,
} from "./index";

describe("ConfigBuilder", () => {
	it("should create an instance of ConfigBuilder", () => {
		const configBuilder = new ConfigBuilder({
			validate: (finalConfig, z) =>
				z
					.object({
						baseURL: z.url(),
					})
					.parse(finalConfig),
		});

		expect(configBuilder).toBeInstanceOf(ConfigBuilder);
	});

	it("should not use node apis when build config", () => {
		const envSpy = vi.spyOn(process, "env", "get");

		new ConfigBuilder({
			validate: (finalConfig, z) =>
				z
					.object({
						baseURL: z.url(),
					})
					.parse(finalConfig),

			runtimeEnv: {
				BASE_URL: "http://localhost:3000",
			},
		})
			.addSource(
				new ObjectSource({
					baseURL: "$BASE_URL",
				}),
			)
			.build();

		expect(envSpy).not.toHaveBeenCalled();
	});

	it("should return the configured object", () => {
		const mockBaseURL = "http://localhost:3000";

		// @ts-expect-error: Mocking import.meta.env for testing purposes
		import.meta.env = {
			BASE_URL: mockBaseURL,
		};

		const config = new ConfigBuilder({
			validate: (finalConfig, z) =>
				z
					.object({
						baseURL: z.url(),
					})
					.parse(finalConfig),

			runtimeEnv: import.meta.env,
		})
			.addSource(
				new ObjectSource({
					baseURL: "$BASE_URL",
				}),
			)
			.build();

		expect(config.baseURL).toBe(mockBaseURL);
	});

	it("should provide EnvironmentVariableSource", () => {
		const mockFooValue = "zzzzz";

		// @ts-expect-error: Mocking import.meta.env for testing purposes
		import.meta.env = {
			BASE_URL: "http://localhost:3000",
			APP_foo: mockFooValue,
		};

		const config = new ConfigBuilder({
			validate: (finalConfig, z) =>
				z
					.object({
						baseURL: z.url(),
						foo: z._default(z.string(), "bar"),
					})
					.parse(finalConfig),

			runtimeEnv: import.meta.env,
		})
			.addSource(
				new ObjectSource({
					baseURL: "$BASE_URL",
				}),
			)
			.addSource(new EnvironmentVariableSource())
			.build();

		expect(config.foo).toBe(mockFooValue);
	});

	it("should export zod mini", () => {
		expect(z).toBeDefined();
		expect(z._default(z.string(), "foo").parse(undefined)).toBe("foo");
	});
});
