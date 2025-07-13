import { ConfigBuilder, type z } from "@layerfig/config";
import { ObjectSource } from "@layerfig/config/sources/object";
import { ConfigSchema } from "./schema";

const ClientEnvSchema = ConfigSchema.pick({
  env: true,
});
type ClientEnvSchema = z.infer<typeof ClientEnvSchema>;

export const clientEnv = new ConfigBuilder({
  validate: (finalConfig) => ClientEnvSchema.parse(finalConfig),
  runtimeEnv: import.meta.env,
})
  .addSource(
    new ObjectSource<ClientEnvSchema>({
      env: "$VITE_APP_ENV",
    })
  )
  .build();
