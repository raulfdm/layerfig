import { EnvironmentVariableSource } from "../sources/env-var";
import { ObjectSource } from "../sources/object";
import {
	type ClientConfigBuilderOptions,
	DEFAULT_SLOT_PREFIX,
	RuntimeEnv,
	type UnknownRecord,
	type ValidatedClientConfigBuilderOptions,
} from "../types";
import { z } from "../zod-mini";

/**
 * This notation only serves to not have the following error:
 *
 * ```
 * RollupError: src/client/types.ts(12,14): error TS2742: The inferred type of
 * 'ClientConfigBuilderOptionsSchema' cannot be named without a
 * reference to '../../../../node_modules/zod/v4/mini/external.d.cts'.
 * This is likely not portable. A type annotation is necessary.
 * ```
 */
export const ClientConfigBuilderOptionsSchema: z.ZodMiniType<ValidatedClientConfigBuilderOptions> =
	z.object({
		runtimeEnv: z._default(RuntimeEnv, import.meta.env || {}),
		validate: z.custom<ClientConfigBuilderOptions["validate"]>(),
		slotPrefix: z._default(z.string(), DEFAULT_SLOT_PREFIX),
	});

export const ClientSources = z.union(
	[z.instanceof(ObjectSource), z.instanceof(EnvironmentVariableSource)],
	{
		error:
			"Invalid source. Client ConfigBuilder only Accepts ObjectSource or EnvironmentVariableSource",
	},
);
export type ClientSources = z.output<typeof ClientSources>;

export type ConfigBuilderOptions<T extends object = UnknownRecord> =
	ClientConfigBuilderOptions<T>;
