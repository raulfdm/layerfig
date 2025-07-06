import type { ConfigParser } from "../parser/define-config-parser";

interface RuntimeEnv {
	[key: string]: string | undefined;
}

export interface LoadSourceOptions {
	configFolderPath: string;
	parser: ConfigParser;
	/**
	 * The runtime environment variables to use (e.g., process.env or import.env)
	 * @default process.env
	 */
	runtimeEnv: RuntimeEnv;
	slotPrefix: string;
}

export abstract class Source {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(
		loadSourceOptions: LoadSourceOptions,
	): Record<string, unknown>;
}
