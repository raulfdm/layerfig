// import cloudflare from "@astrojs/cloudflare";
import starlight from "@astrojs/starlight";
// @ts-check
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
					href: "https://github.com/withastro/starlight",
				},
			],
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
					items: [
						"setup/configuration",
						{
							label: "Sources",
							items: [
								"setup/sources/overview",
								"setup/sources/files",
								"setup/sources/env-var",
								"setup/sources/json-schema",
							],
						},
					],
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
							label: "JSON Schema",
							link: "examples/json-schema",
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

	// adapter: cloudflare({
	// 	imageService: "compile",
	// }),
});
