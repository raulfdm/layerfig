import { config } from "./config.ts";

const handler = (_request: Request) => {
  return new Response(JSON.stringify({ details: "Config content", config }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

Deno.serve({ port: config.port }, handler);
