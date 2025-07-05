import path from "node:path";
import url from "node:url";

import { describe, expect, it } from "vitest";
import { basicJsonParser } from "../parser/parser-json";
import { EnvironmentVariableSource } from "./env-var";
import type { LoadSourceOptions } from "./type";

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
});
