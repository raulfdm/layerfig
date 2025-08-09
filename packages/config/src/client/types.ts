import { EnvironmentVariableSource } from "../sources/env-var";
import { ObjectSource } from "../sources/object";
import { BaseConfigBuilderOptions, RuntimeEnv } from "../types";
import { z } from "../zod-mini";

export interface ClientConfigBuilderOptions<
	T extends object = Record<string, unknown>,
> extends Omit<BaseConfigBuilderOptions, "parser" | "configFolder"> {
	/**
	 * The runtime environment variables to use (e.g., import.meta.env, object, etc.)
	 * @default import.meta.env or {}
	 */
	runtimeEnv?: RuntimeEnv;
	/**
	 * A function to validate the configuration object.
	 * @param config - The configuration object to be validated
	 * @param zod - The zod 4-mini instance
	 */
	validate: (config: Record<string, unknown>, zod: typeof z) => T;
}

export const ClientConfigBuilderOptions = z.extend(BaseConfigBuilderOptions, {
	runtimeEnv: z._default(RuntimeEnv, import.meta.env || {}),
	validate: z.custom<ClientConfigBuilderOptions["validate"]>(),
}) satisfies z.ZodMiniType<ClientConfigBuilderOptions>;

export type ValidateClientConfigBuilderOptions = z.output<
	typeof ClientConfigBuilderOptions
>;

export const ClientSources = z.union(
	[z.instanceof(ObjectSource), z.instanceof(EnvironmentVariableSource)],
	{
		error:
			"Invalid source. Client ConfigBuilder only Accepts ObjectSource or EnvironmentVariableSource",
	},
);
export type ClientSources = z.output<typeof ClientSources>;
