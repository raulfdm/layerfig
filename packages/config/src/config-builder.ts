import path from "node:path";
import { z as zod } from "zod/v4";
import type { ConfigParser } from "./parser/define-config-parser";
import { basicJsonParser } from "./parser/parser-json";
import {
	AnyObject,
	EnvVarSourceOptions,
	type PartialEnvVarSource,
} from "./types";
import { merge, readIfExist, set } from "./utils";

const APP_ROOT_PATH = process.cwd();

export interface ConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> {
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 instance
	 */
	validate: (config: Record<string, unknown>, z: typeof zod) => T;
	/**
	 * The folder where the configuration files are located.
	 * @default "./config"
	 */
	configFolder?: string;
	/**
	 * Load source from different source types
	 */
	parser?: ConfigParser;
	/**
	 * Prefix used to search for slotted values
	 * @default "$"
	 */
	slotPrefix?: string;
}

type AcceptedSource = string | EnvVarConfig;

export class ConfigBuilder<T extends object = Record<string, unknown>> {
	#options: ConfigBuilderOptions<T>;
	#partialConfig: AnyObject = {};
	#appConfigFolderAbsolutePath: string;
	#sources: AcceptedSource[] = [];

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
		for (const source of this.#sources) {
			this.#loadSource(source);
		}

		return this.#options.validate(this.#partialConfig, zod);
	}

	public addSource(source: AcceptedSource): this {
		if (
			source instanceof EnvVarConfig === false &&
			typeof source !== "string"
		) {
			throw new Error(`Source type of "${typeof source}" is not valid.`);
		}

		this.#sources.push(source);

		return this;
	}

	#loadSource(source: string | EnvVarConfig): this {
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
					`".${fileExtension}" file is not supported by this parser. Accepted files are: "${this.#parser.acceptedFileExtensions.join(
						", ",
					)}"`,
				);
			}

			const fileContentResult = readIfExist(filePath);

			if (fileContentResult.ok === false) {
				throw new Error(fileContentResult.error);
			}

			const finalContent = this.#replaceSlots(fileContentResult.data);
			const parserResult = this.#parser.load(finalContent);

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

	#replaceSlots(fileContent: string) {
		const slotPrefix = this.#options.slotPrefix || "$";
		const regex = new RegExp(`\\${slotPrefix}\\w+`, "g");

		const matches = fileContent.match(regex);

		if (matches === null) {
			return fileContent;
		}

		const uniqueSlots = new Set(matches);

		let copy = fileContent;

		for (const slot of uniqueSlots) {
			const slotWithoutPrefix = slot.replace(slotPrefix, "");
			const value = process.env[slotWithoutPrefix];

			// Do not replace if the variable is not there
			if (typeof value === "string" && value !== "undefined") {
				copy = copy.replaceAll(slot, value);
			}
		}

		return copy;
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
