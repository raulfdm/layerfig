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
					label: "Documentation",
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: "Intro", slug: "documentation/intro", link: "intro" },
					],
				},
			],
		}),
	],
	redirects: {
		"/": "/documentation/intro",
	},

	adapter: cloudflare({
		imageService: "compile",
	}),
});
