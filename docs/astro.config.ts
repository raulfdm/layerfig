import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeNova from "starlight-theme-nova";
import { config } from "./src/config";
import { examples } from "./src/pages/examples/examples";

// https://astro.build/config
export default defineConfig({
	vite: {
		ssr: {
			/**
			 * Zod from astro is v3 while Layerfig uses v4
			 * In a monorepo with bun, it mix the imports so we need to exclude it so we
			 * need to exclude it from the SSR build.
			 * @see https://github.com/withastro/astro/issues/14117#issuecomment-3117797751
			 */
			noExternal: ["zod"],
		},
	},
	integrations: [
		starlight({
			plugins: [starlightThemeNova()],
			title: "",
			logo: {
				light: "./src/assets/light-logo.svg",
				dark: "./src/assets/dark-logo.svg",
				alt: "Layerfig",
			},
			customCss: ["./src/styles/globals.css"],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/raulfdm/layerfig",
				},
			],
			editLink: {
				baseUrl: config.editLink,
			},
			sidebar: [
				{
					label: "Start Here",
					items: [
						{ label: "Introduction", slug: "introduction", link: "intro" },
						{
							label: "Motivation",
							link: "getting-started/motivation",
						},
						{
							label: "Getting Started",
							slug: "getting-started",
							link: "getting-started/index",
						},
						{
							label: "Migrate to v3",
							link: "migrate-to-v3",
							badge: {
								text: "New",
							},
						},
					],
				},
				{
					label: "Setup",
					items: [
						"setup/configuration",
						"setup/configuration-client",
						"setup/sources",
						"setup/slots",
					],
				},
				{
					label: "Parsers",
					items: [
						"parsers/yaml",
						"parsers/json5",
						"parsers/toml",
						"parsers/custom",
					],
				},
				{
					label: "Guides & Best Practices",
					items: [
						"guides/deno",
						"guides/docker",
						"guides/dynamic-environment",
						"guides/client-config",
					],
				},
				{
					label: "Examples",
					items: Array.from(examples.values()).map(
						(example) => example.sideMenu,
					),
				},
			],
		}),
	],
});
