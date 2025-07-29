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
    baseURL.searchParams.set(
      "file",
      this.options.startFile || "src/config/index.ts",
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
      startFile: "src/config/index.ts",
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
      startFile: "config/basic.json",
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
      sideMenu:{
        label: "Deno",
        link: 'https://github.com/raulfdm/layerfig/tree/main/examples/multi-tenant'
      }
    })
  ],
  [
    "json5",
    new Example({
      name: "json5",
      startFile: "src/config/index.ts",
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
      startFile: "src/config/index.ts",
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
      startFile: "src/config/index.ts",
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
      startFile: "src/config/index.ts",
      title: "Valibot example",
      sideMenu:{
        label: 'Valibot'
      }
    }),
  ],
]);
