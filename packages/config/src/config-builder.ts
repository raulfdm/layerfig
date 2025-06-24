import path from "node:path";

import { merge, set } from "lodash-es";
import type { ConfigParser } from "./parser/define-config-parser";
import { basicJsonParser } from "./parser/parser-json";
import {
	AnyObject,
	EnvVarSourceOptions,
	type PartialEnvVarSource,
} from "./types";
import { readIfExist } from "./utils";

const APP_ROOT_PATH = process.cwd();

interface ConfigBuilderOptions<T extends object = Record<string, unknown>> {
	/**
	 * A function to validate the configuration object.
	 */
	validate: (config: Record<string, unknown>) => T;
	/**
	 * The folder where the configuration files are located.
	 * @default "./config"
	 */
	configFolder?: string;
	/**
	 * Load source from different source types
	 */
	parser?: ConfigParser;
}

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ConfigBuilderOptions<T>;
	#partialConfig: AnyObject = {};
	#appConfigFolderAbsolutePath: string;

	constructor(options: ConfigBuilderOptions<T>) {
		this.#options = options;
		this.#appConfigFolderAbsolutePath = path.join(
			APP_ROOT_PATH,
			this.#options.configFolder ?? "./config",
		);
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
			const fileExtension = this.#getFileExtension(filePath);

			if (this.#parser.acceptsExtension(fileExtension) === false) {
				throw new Error(
					`".${fileExtension}" file is not supported by this parser. Accepted files are: "${this.#parser.acceptedFileExtensions.join(", ")}"`,
				);
			}

			const fileContentResult = readIfExist(filePath);

			if (fileContentResult.ok === false) {
				throw new Error(fileContentResult.error);
			}

			const parserResult = this.#parser.load(fileContentResult.data);

			if (parserResult.ok) {
				this.#partialConfig = merge({}, this.#partialConfig, parserResult.data);
			} else {
				throw parserResult.error;
			}
		} else {
			throw new Error("Invalid source. Please provide a valid one.");
		}

		return this;
	}

	get #parser(): ConfigParser {
		return this.#options.parser || basicJsonParser;
	}

	#addEnvironmentVariables(source: EnvVarConfig): void {
		this.#partialConfig = merge({}, this.#partialConfig, source.getEnvVars());
	}

	#getFileExtension(filePath: string): string {
		return path.extname(filePath).slice(1);
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
