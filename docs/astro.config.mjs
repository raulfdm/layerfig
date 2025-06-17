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
					label: "Setup",
					items: [
						"setup/configuration",
						"setup/config-folder",
						"setup/file-formats",
					],
				},
				{
					label: "Sources",
					items: [
						"sources/intro",
						{
							label: "JSON",
							collapsed: true,
							items: ["sources/json/overview", "sources/json/cli"],
						},
						"sources/yaml",
						"sources/env-vars",
					],
				},
				{
					label: "Guides & Best Practices",
					items: ["guides/docker", "guides/12-factor-app", "guides/faq"],
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
