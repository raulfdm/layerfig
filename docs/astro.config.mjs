// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

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
						"getting-started",
					],
				},
				{
					label: "Setup",
					items: ["setup/configuration", "setup/sources"],
				},
				{
					label: "Parsers",
					items: ["parsers/yaml", "parsers/json5", "parsers/custom"],
				},
				{
					label: "Guides & Best Practices",
					items: [
						"guides/docker",
						"guides/12-factor-app",
						"guides/dynamic-environment",
					],
				},
				{
					label: "Examples",
					items: [
						{
							label: "Basic",
							link: "examples/basic",
						},
						{
							label: "Docker",
							link: "examples/docker",
						},
					],
				},
			],
		}),
	],
	redirects: {
		"/": "/introduction",
	},
});
