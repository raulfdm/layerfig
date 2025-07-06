import path from "node:path";
import url from "node:url";

import { describe, expect, it } from "vitest";
import { basicJsonParser } from "../parser/parser-json";
import { EnvironmentVariableSource } from "./env-var";
import type { LoadSourceOptions } from "./source";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const fixturePaths = path.resolve(__dirname, "../__fixtures__");

const baseLoadSourceOptions: LoadSourceOptions = {
	configFolderPath: fixturePaths,
	parser: basicJsonParser,
	runtimeEnv: process.env,
	slotPrefix: "$",
};

describe("EnvironmentVariableSource", () => {
	it("should load from environment variable", () => {
		const envVarSource = new EnvironmentVariableSource();

		expect(
			envVarSource.loadSource({
				...baseLoadSourceOptions,
				runtimeEnv: {
					APP_appURL: "https://my-site.com",
					APP_api__port: "3000",
				},
			}),
		).toEqual({
			api: {
				port: "3000",
			},
			appURL: "https://my-site.com",
		});
	});

	it("should not add variables that does not match with prefix", () => {
		const envVarSource = new EnvironmentVariableSource();

		expect(
			envVarSource.loadSource({
				...baseLoadSourceOptions,
				runtimeEnv: {
					FOO: "bar",
				},
			}),
		).toEqual({});
	});

	it("should consider custom prefix, prefixSeparator and prop separator", () => {
		const envVarSource = new EnvironmentVariableSource({
			prefix: "TEST",
			prefixSeparator: "-",
			separator: "_-_",
		});

		expect(
			envVarSource.loadSource({
				...baseLoadSourceOptions,
				runtimeEnv: {
					"TEST-appURL": "https://my-site.com",
					"TEST-api_-_port": "5000",
				},
			}),
		).toEqual({
			appURL: "https://my-site.com",
			api: {
				port: "5000",
			},
		});
	});

	describe("slots", () => {
		it("should replace slot value", () => {
			const envVarSource = new EnvironmentVariableSource();

			expect(
				envVarSource.loadSource({
					...baseLoadSourceOptions,
					runtimeEnv: {
						PORT: "3000",
						APP_appURL: "http://localhost:$PORT",
						APP_api__port: "$PORT",
					},
				}),
			).toEqual({
				api: {
					port: "3000",
				},
				appURL: "http://localhost:3000",
			});
		});

		it("should replace values with multiple values", () => {
			const envVarSource = new EnvironmentVariableSource();

			expect(
				envVarSource.loadSource({
					...baseLoadSourceOptions,
					runtimeEnv: {
						PORT: "3000",
						HOST: "127.0.1",
						APP_appURL: "http://$HOST:$PORT",
						APP_api__port: "$PORT",
					},
				}),
			).toEqual({
				api: {
					port: "3000",
				},
				appURL: "http://127.0.1:3000",
			});
		});
	});
});
