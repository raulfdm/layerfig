import path from "node:path";
import { z } from "zod/mini";
import type { ConfigParser } from "../parser/config-parser";
import { basicJsonParser } from "../parser/parser-json";
import {
	DEFAULT_SLOT_PREFIX,
	RuntimeEnv,
	type ServerConfigBuilderOptions,
	type UnknownRecord,
	type ValidatedServerConfigBuilderOptions,
} from "../types";

export const ServerConfigBuilderOptionsSchema: z.ZodMiniType<ValidatedServerConfigBuilderOptions> =
	z.object({
		absoluteConfigFolderPath: z._default(
			z
				.string()
				.check(
					z.refine((value) => path.isAbsolute(value), "Path must be absolute"),
				),
			path.resolve(process.cwd(), "./config"),
		),
		configFolder: z._default(z.string(), "./config"),
		runtimeEnv: z._default(RuntimeEnv, process.env),
		parser: z._default(z.custom<ConfigParser>(), basicJsonParser),
		validate: z.custom<ServerConfigBuilderOptions["validate"]>(),
		slotPrefix: z._default(z.string(), DEFAULT_SLOT_PREFIX),
	});

export type ConfigBuilderOptions<T extends object = UnknownRecord> =
	ServerConfigBuilderOptions<T>;
