import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeNova from "starlight-theme-nova";
import { config } from "./src/config";
import { examples } from "./src/pages/examples/examples";

// https://astro.build/config
export default defineConfig({
	/**
	 * Required for canonical URLs, absolute Open Graph URLs and the sitemap
	 * Starlight generates automatically.
	 */
	site: "https://layerfig.dev",
	integrations: [
		starlight({
			plugins: [starlightThemeNova()],
			/**
			 * The site name is used for `<title>` suffixes and `og:site_name`, so it
			 * must be set. `replacesTitle` keeps the header showing the logo alone.
			 */
			title: "Layerfig",
			logo: {
				light: "./src/assets/light-logo.svg",
				dark: "./src/assets/dark-logo.svg",
				alt: "Layerfig",
				replacesTitle: true,
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
						{ label: "Introduction", slug: "introduction" },
						{ label: "Motivation", slug: "getting-started/motivation" },
						{ label: "Getting Started", slug: "getting-started" },
						{ label: "Migrate to v3", slug: "migrate-to-v3" },
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
						"guides/server-or-client",
						"guides/dynamic-environment",
						"guides/client-config",
						"guides/testing",
						"guides/docker",
						"guides/deno",
					],
				},
				{
					label: "Reference",
					items: ["reference/api", "reference/troubleshooting"],
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
