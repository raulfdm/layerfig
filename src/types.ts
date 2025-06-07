import { z } from 'zod';

interface ResultSuccess<TSuccess = undefined> {
  ok: true;
  data: TSuccess;
}

interface ResultError<TError = undefined> {
  ok: false;
  error?: TError;
}

export type Result<TSuccess = undefined, TError = undefined> =
  | ResultSuccess<TSuccess>
  | ResultError<TError>;

export const AnyObject = z.object({}).passthrough();
export type AnyObject = z.infer<typeof AnyObject>;

export type AcceptedFileType = 'json' | 'yaml';
export const jsonExtensions = ['json', 'jsonc', 'json5'] as const;
export const yamlExtensions = ['yaml', 'yml'] as const;

export const EnvVarSourceOptions = z.object({
  /**
   * The environment variable prefix to use
   * @default 'APP
   */
  prefix: z.string().optional().default('APP'),
  /**
   * The separator to use between the prefix and the key
   * @default '_'
   */
  prefixSeparator: z.string().optional().default('_'),
  /**
   * The separator to navigate the object
   * @default '__'
   */
  separator: z.string().optional().default('__'),
  /**
   * The runtime environment variables to use (e.g., process.env or import.env)
   * @default process.env
   */
  runtimeEnv: z
    .record(z.union([z.string(), z.boolean(), z.number(), z.undefined()]))
    .optional()
    .default(process.env),
});
export type EnvVarSourceOptions = z.infer<typeof EnvVarSourceOptions>;

const PartialEnvVarSource = EnvVarSourceOptions.partial();
export type PartialEnvVarSource = z.infer<typeof PartialEnvVarSource>;
