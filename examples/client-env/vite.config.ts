import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    // Build `server/app.ts` as the SSR entry instead of the default
    // React Router server build, so `server.js` can mount the Express app.
    ssr: {
      build: {
        rollupOptions: {
          input: "./server/app.ts",
        },
      },
    },
  },
  plugins: [tailwindcss(), reactRouter()],
});
