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

export interface Source {
	loadSource(loadSourceOptions: LoadSourceOptions): Record<string, unknown>;
}
