import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { examples } from "./src/pages/examples/examples";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "",
			logo: {
				light: "./src/assets/light-logo.svg",
				dark: "./src/assets/dark-logo.svg",
				alt: "Layerfig",
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/raulfdm/layerfig",
				},
			],
			editLink: {
				baseUrl: "https://github.com/raulfdm/layerfig/tree/main/docs",
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
					],
				},
				{
					label: "Setup",
					items: ["setup/configuration", "setup/sources", "setup/slots"],
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
