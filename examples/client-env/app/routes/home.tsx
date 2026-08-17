import type { Route } from "./+types/home";
import { clientEnv } from "~/config/client";
import { serverConfig } from "~/config/server";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Layerfig: Client Environment Example" },
    {
      name: "description",
      content: "Reading config on the server and on the client with Layerfig.",
    },
  ];
}

export function loader(_: Route.LoaderArgs) {
  return serverConfig;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="grid place-items-center h-full">
      <div className="flex flex-col gap-4">
        <section>
          <h2>Server Environment sent via loader (DANGEROUS)</h2>
          <pre>
            <code>{JSON.stringify(loaderData, null, 2)}</code>
          </pre>
        </section>

        <section>
          <h2>Client Environment consumed directly</h2>
          <pre>
            <code>{JSON.stringify(clientEnv, null, 2)}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
