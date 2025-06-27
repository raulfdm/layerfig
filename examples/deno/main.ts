import { config } from "./config.ts";

const handler = (_request: Request) => {
  const body = `Hello from Deno on local`;

  return new Response(body, { status: 200 });
};

Deno.serve({ port: config.port }, handler);
