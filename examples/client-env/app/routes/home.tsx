import type { Route } from "./+types/home";
import { clientEnv } from "~/config/client";
import { serverConfig } from "~/config/server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
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
