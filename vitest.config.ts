import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		retry: process.env.CI ? 2 : 0,
	},
});
