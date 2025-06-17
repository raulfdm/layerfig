import path from "node:path";
import json5 from "json5";
import { merge, set } from "lodash-es";
import yaml from "yaml";
import type { z } from "zod";

import {
	type AcceptedFileType,
	AnyObject,
	EnvVarSourceOptions,
	type PartialEnvVarSource,
	jsonExtensions,
	yamlExtensions,
} from "./types";
import { readIfExist } from "./utils";

const APP_ROOT_PATH = process.cwd();

interface ConfigBuilderOptions {
	configFolder?: string;
}

export class ConfigBuilder<TSchema extends z.ZodType<object>> {
	#schema: TSchema;
	#partialConfig: AnyObject = {};
	#appConfigFolderAbsolutePath: string;

	constructor(
		schema: TSchema,
		{ configFolder = "./config" }: ConfigBuilderOptions = {},
	) {
		this.#schema = schema;
		this.#appConfigFolderAbsolutePath = path.join(APP_ROOT_PATH, configFolder);
	}

	static createEnvVarSource(options: PartialEnvVarSource = {}) {
		const parsedOptions = EnvVarSourceOptions.parse(options);
		return new EnvVarConfig(parsedOptions);
	}

	public build(): z.infer<TSchema> {
		const result = this.#schema.safeParse(this.#partialConfig);

		if (result.success) {
			return result.data;
		}

		throw new Error(`Fail to parse config: ${result.error.message}`);
	}

	public addSource(source: string | EnvVarConfig): this {
		if (source instanceof EnvVarConfig) {
			this.#addEnvironmentVariables(source);
		} else if (typeof source === "string") {
			const fileName = source;
			const filePath = path.resolve(
				this.#appConfigFolderAbsolutePath,
				fileName,
			);
			const fileType = this.#getFileType(filePath);

			if (fileType === null) {
				throw new Error(`File type "${fileName}" not supported.`);
			}

			const fileContentResult = readIfExist(filePath);

			if (fileContentResult.ok === false) {
				throw new Error(fileContentResult.error);
			}

			if (fileType === "yaml") {
				this.#addYamlSource(fileContentResult.data);
			}
			if (fileType === "json") {
				this.#addJsonSource(fileContentResult.data);
			}
		} else {
			throw new Error("Invalid source. Please provide a valid one.");
		}

		return this;
	}

	#addEnvironmentVariables(source: EnvVarConfig): void {
		this.#partialConfig = merge({}, this.#partialConfig, source.getEnvVars());
	}

	#addJsonSource(source: string): void {
		const parsedJson = json5.parse(source);
		this.#partialConfig = AnyObject.parse(
			merge({}, this.#partialConfig, parsedJson),
		);
	}

	#addYamlSource(source: string): void {
		const parsedYaml = yaml.parse(source);
		this.#partialConfig = AnyObject.parse(
			merge({}, this.#partialConfig, parsedYaml),
		);
	}

	#getFileType(filePath: string): AcceptedFileType | null {
		const fileExtension = path.extname(filePath).slice(1);

		if (jsonExtensions.includes(fileExtension as never)) {
			return "json";
		}

		if (yamlExtensions.includes(fileExtension as never)) {
			return "yaml";
		}

		return null;
	}
}

class EnvVarConfig {
	#separator: NonNullable<EnvVarSourceOptions["separator"]>;
	#runtimeEnv: NonNullable<EnvVarSourceOptions["runtimeEnv"]>;
	#prefixWithSeparator: string;

	constructor({
		prefix,
		prefixSeparator,
		separator,
		runtimeEnv,
	}: EnvVarSourceOptions) {
		this.#prefixWithSeparator = `${prefix}${prefixSeparator}`;

		this.#separator = separator;
		this.#runtimeEnv = runtimeEnv;
	}

	getEnvVars() {
		const envKeys = Object.keys(process.env).filter((key) =>
			key.startsWith(this.#prefixWithSeparator),
		);

		const tempObject = {} as Record<string, unknown>;

		for (const envKey of envKeys) {
			const keyWithoutPrefix = envKey.replace(this.#prefixWithSeparator, "");
			const keyParts = keyWithoutPrefix.split(this.#separator).join(".");

			set(tempObject, keyParts, this.#runtimeEnv[envKey]);
		}

		return AnyObject.parse(tempObject);
	}
}
