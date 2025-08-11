import { ConfigParser } from "../parser/config-parser";
import { basicJsonParser } from "../parser/parser-json";
import {
	DEFAULT_SLOT_PREFIX,
	RuntimeEnv,
	type ServerConfigBuilderOptions,
	type UnknownRecord,
	type ValidatedServerConfigBuilderOptions,
} from "../types";
import { z } from "../zod-mini";

export const ServerConfigBuilderOptionsSchema: z.ZodMiniType<
	ValidatedServerConfigBuilderOptions,
	ServerConfigBuilderOptions,
	// biome-ignore lint/suspicious/noExplicitAny: unknown or never would not work
	any
> = z.object({
	configFolder: z._default(z.string(), "./config"),
	runtimeEnv: z._default(RuntimeEnv, process.env),
	parser: z._default(z.instanceof(ConfigParser), basicJsonParser),
	validate: z.custom<ServerConfigBuilderOptions["validate"]>(),
	slotPrefix: z._default(z.string(), DEFAULT_SLOT_PREFIX),
});

export type ConfigBuilderOptions<T extends object = UnknownRecord> =
	ServerConfigBuilderOptions<T>;
