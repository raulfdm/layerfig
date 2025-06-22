import path from "node:path";

import json5 from "json5";
import { merge, set } from "lodash-es";
import yaml from "yaml";

import {
	type AcceptedFileType,
	AnyObject,
	EnvVarSourceOptions,
	jsonExtensions,
	type PartialEnvVarSource,
	yamlExtensions,
} from "./types";
import { readIfExist } from "./utils";

const APP_ROOT_PATH = process.cwd();

interface ConfigBuilderOptions<T extends object = Record<string, unknown>> {
	/**
	 * A function to validate the configuration object.
	 */
	validate: (config:Record<string, unknown>) => T,
	/**
	 * The folder where the configuration files are located.
	 * @default "./config"
	 */
	configFolder?: string;
}

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ConfigBuilderOptions<T>;
	#partialConfig: AnyObject = {};
	#appConfigFolderAbsolutePath: string;

	constructor(
		options: ConfigBuilderOptions<T>,
	) {
		this.#options = options;
		this.#appConfigFolderAbsolutePath = path.join(APP_ROOT_PATH, this.#options.configFolder ?? "./config");
	}

	static createEnvVarSource(options: PartialEnvVarSource = {}) {
		const parsedOptions = EnvVarSourceOptions.parse(options);
		return new EnvVarConfig(parsedOptions);
	}

	public build(): T {
		return this.#options.validate(this.#partialConfig);
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
