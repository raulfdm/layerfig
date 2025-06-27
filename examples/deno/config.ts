import { ConfigBuilder } from "npm:@layerfig/config";
import {z} from "npm:zod";

const schema = z.object({
  port: z.number(),
});

export const config = new ConfigBuilder({
  validate: (fullConfig) => schema.parse(fullConfig),
})
  .addSource("base.json")
  .addSource("live.json")
  .build();
