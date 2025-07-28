import { ConfigBuilder, ObjectSource, type z } from "@layerfig/config/client";
import { ConfigSchema } from "./schema";

const ClientEnvSchema = ConfigSchema.pick({
  env: true,
});
type ClientEnvSchema = z.output<typeof ClientEnvSchema>;

export const clientEnv = new ConfigBuilder({
  validate: (finalConfig) => ClientEnvSchema.parse(finalConfig),
  runtimeEnv: import.meta.env,
})
  .addSource(
    new ObjectSource<ClientEnvSchema>({
      env: "$VITE_APP_ENV",
    }),
  )
  .build();
