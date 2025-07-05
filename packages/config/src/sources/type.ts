import type { ConfigParser } from "../parser/define-config-parser";
import type { RuntimeEnv } from "../types";

export interface LoadSourceOptions {
	configFolderPath: string;
	parser: ConfigParser;
	runtimeEnv: RuntimeEnv;
	slotPrefix: string;
}

export interface Source {
	loadSource(loadSourceOptions: LoadSourceOptions): Record<string, unknown>;
}
