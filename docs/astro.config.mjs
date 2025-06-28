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
						"guides/12-factor-app",
						"guides/deno",
						"guides/docker",
						"guides/dynamic-environment",
					],
				},
				{
					label: "Examples",
					collapsed: true,
					items: [
						{
							label: "Basic",
							link: "examples/basic",
						},
						{
							label: "Deno",
							link: "https://github.com/raulfdm/layerfig/tree/main/examples/deno",
						},
						{
							label: "Docker",
							link: "examples/docker",
						},
						{
							label: "Dynamic Environment",
							link: "examples/dynamic-env",
						},
						{
							label: "Json5",
							link: "examples/json5",
						},
						{
							label: "Toml",
							link: "examples/toml",
						},
						{
							label: "Yaml",
							link: "examples/yaml",
						},
						{
							label: "Valibot",
							link: "examples/valibot",
						},
						{
							label: "Slots",
							link: "examples/slots",
						},
					],
				},
			],
		}),
	],
});
