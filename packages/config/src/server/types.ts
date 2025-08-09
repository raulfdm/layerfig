import { ConfigParser } from "../parser/config-parser";
import { basicJsonParser } from "../parser/parser-json";
import { BaseConfigBuilderOptions, RuntimeEnv } from "../types";
import type { z as zodInstance } from "../zod";
import { z } from "../zod-mini";

export interface ServerConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> extends BaseConfigBuilderOptions {
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
	 * The runtime environment variables to use (e.g., process.env, import.meta.env, etc.)
	 * @default process.env
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param z - The zod 4 instance
	 */
	validate: (config: Record<string, unknown>, zod: typeof zodInstance) => T;
}

export const ServerConfigBuilderOptions = z.extend(BaseConfigBuilderOptions, {
	configFolder: z._default(z.string(), "./config"),
	runtimeEnv: z._default(RuntimeEnv, process.env),
	parser: z._default(z.instanceof(ConfigParser), basicJsonParser),
	validate: z.custom<ServerConfigBuilderOptions["validate"]>(),
}) satisfies z.ZodMiniType<ServerConfigBuilderOptions>;

export type ValidatedServerConfigBuilderOptions = z.output<
	typeof ServerConfigBuilderOptions
>;
