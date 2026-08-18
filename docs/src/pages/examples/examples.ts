import { config } from "../../config";

interface ExampleOptions {
  name: string;
  title: string;
  note?: string;
  startFile?: string;
  sideMenu: {
    label: string,
    link?: string
  }
}

class Example {
  constructor(private options: ExampleOptions) {}

  get title() {
    return this.options.title;
  }

  get note() {
    return this.options.note;
  }

  get src() {
    const baseURL = new URL(
      `https://stackblitz.com/github/raulfdm/layerfig/tree/${config.branchName}/examples/${this.options.name}`,
    );
    baseURL.searchParams.set("embed", "1");
    /**
     * Makes StackBlitz serve the embedded document with COOP/COEP of its own.
     * Without it the frame never becomes cross-origin isolated and the
     * WebContainer refuses to boot, even though we send the headers on our
     * side. See public/_headers.
     */
    baseURL.searchParams.set("corp", "1");
    baseURL.searchParams.set(
      "file",
      this.options.startFile || "src/config.ts",
    );

    return baseURL.toString();
  }

  get route(): { params: { name: string } } {
    return { params: { name: this.options.name } };
  }

  get sideMenu(): {
    label: string;
    link: string;
    badge?: {
      text: string
    },
    attrs?: {
      target: '_blank'
    }
  } {
    return {
      label: this.options.sideMenu.label,
      link: this.options.sideMenu.link || `examples/${this.options.name}`,
      badge: this.isExternal ? {
        text: 'repo'
      }:  undefined,
      attrs: this.isExternal ? {
        target: '_blank'
      } : undefined
    };
  }

  get isExternal(): boolean{
    return Boolean(this.options.sideMenu.link) || false
  }
}

export const examples = new Map<string, Example>([
  [
    "basic",
    new Example({
      name: "basic",
      note: "The smallest setup there is: one `base.json`, one `FileSource`, and a Zod schema that turns it into a typed `config` object. Start here.",
      title: "Basic Example",
      sideMenu:{
        label: 'Basic'
      }
    }),
  ],
  [
    "client-env",
    new Example({
      name: "client-env",
      note: "Splits config in two for a React Router app. The server reads everything; the browser bundle only receives the keys explicitly listed in an `ObjectSource`, filled from `import.meta.env` via `${VITE_*}` slots.",
      title: "Client Environment Example",
      startFile: 'app/config/client.ts',
      sideMenu:{
        label: 'Client Environment'
      }
    }),
  ],
  [
    "dynamic-env",
    new Example({
      name: "dynamic-env",
      note: "Layers a per-environment file on top of the shared base. `APP_ENV=local` loads `base.json` then `local.json`; `APP_ENV=prod` swaps in `prod.json`.",
      startFile: "src/config.ts",
      title: "Dynamic Environment",
      sideMenu:{
        label: 'Dynamic Environment'
      }
    }),
  ],
  [
    "docker",
    new Example({
      name: "docker",
      note: "A multi-stage Dockerfile that builds the app, then installs only production dependencies in the final image. Note the `COPY ./config ./config` step — Layerfig reads those files at runtime, so leaving them out of the image is an easy way to break a container that built fine.",
      startFile: "Dockerfile",
      title: "Multi-staged Dockerfile",
      sideMenu:{
        label: 'Docker'
      }
    }),
  ],
  [
    "slots",
    new Example({
      name: "slots",
      note: "Every slot form in one file: `${PORT}` from the environment, `${self.port}` referencing another key, `${APP_VERSION::-not set}` with a literal fallback, and `${DEBUG_LEVEL::LEGACY_DEBUG_LEVEL}` falling back to a second variable. `healthCheckURL` lives in the environment file yet references `port` from the base file, because slots resolve only after every source is merged.",
      startFile: "config/base.json",
      title: "Slots example",
      sideMenu:{
        label: 'Slots'
      }
    }),
  ],
  [
    "multi-tenant",
    new Example({
      name: 'multi-tenant',
      title:'Multi Tenant Environment',
      sideMenu:{
        label: "Multi-tenant App",
        link: 'https://github.com/raulfdm/layerfig/tree/main/examples/multi-tenant'
      }
    })
  ],
  [
    "deno",
    new Example({
      name: 'deno',
      title:'Deno',
      startFile: "config.ts",
      sideMenu:{
        label: "Deno",
        link: 'https://github.com/raulfdm/layerfig/tree/main/examples/deno'
      }
    })
  ],
  [
    "json5",
    new Example({
      name: "json5",
      note: "Reads a `.jsonc` file through `@layerfig/parser-json5`, so the config can carry comments and trailing commas.",
      startFile: "src/config.ts",
      title: "JSONC-like example",
      sideMenu:{
        label: 'JSON5'
      }
    }),
  ],
  [
    "toml",
    new Example({
      name: "toml",
      note: "Reads `base.toml` through `@layerfig/parser-toml`. Only the parser option changes — everything else is the basic setup.",
      startFile: "src/config.ts",
      title: "Toml example",
      sideMenu:{
        label: 'TOML'
      }
    }),
  ],
  [
    "yaml",
    new Example({
      name: "yaml",
      note: "Reads `base.yaml` through `@layerfig/parser-yaml`. Only the parser option changes — everything else is the basic setup.",
      startFile: "src/config.ts",
      title: "Yaml example",
      sideMenu:{
        label: 'YAML'
      }
    }),
  ],
  [
    "valibot",
    new Example({
      name: "valibot",
      note: "`validate` is an ordinary function, so any schema library works. This one parses with Valibot instead of the bundled Zod.",
      startFile: "src/config.ts",
      title: "Valibot example",
      sideMenu:{
        label: 'Valibot'
      }
    }),
  ],
]);
