import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Layerfig",
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
					label: "Configuration",
					items: [
						"configuration/schema",
						"configuration/config-folder",
						"configuration/file-formats",
					],
				},
				{
					label: "Sources",
					items: [
						{
							label: "Concept",
							slug: "sources/intro",
						},
						{
							label: "JSON like",
							slug: "sources/json",
						},
						{
							label: "YAML",
							slug: "sources/yaml",
						},
						{
							label: "Environment Variables",
							slug: "sources/env-vars",
						},
					],
				},
				{
					label: "Typed JSON",
					items: [
						{
							label: "Overview",
							slug: "typed-json/overview",
						},
						{
							label: "CLI",
							slug: "typed-json/cli",
						},
					],
				},
				{
					label: "Guides & Best Practices",
					items: [
						{
							label: "Docker",
							slug: "guides/docker",
						},
						{
							label: "12 Factor App",
							slug: "guides/12-factor-app",
						},
						{
							label: "FAQ",
							slug: "guides/faq",
						},
					],
				},
			],
		}),
	],
	redirects: {
		"/": "/introduction",
	},

	adapter: cloudflare({
		imageService: "compile",
	}),
});
