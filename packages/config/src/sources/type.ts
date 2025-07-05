import type { ConfigParser } from "../parser/define-config-parser";

interface RuntimeEnv {
	[key: string]: string | undefined;
}

export interface LoadSourceOptions {
	configFolderPath: string;
	parser: ConfigParser;
	runtimeEnv: RuntimeEnv;
	slotPrefix: string;
}

export interface Source {
	loadSource(loadSourceOptions: LoadSourceOptions): Record<string, unknown>;
}
