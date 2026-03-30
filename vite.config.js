import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
export default defineConfig({
  build: {
    sourcemap: "hidden", // Source map generation must be turned on ("hidden", true, etc.)
  },
  plugins: [
    // Put the Sentry Vite plugin after all other plugins
    sentryVitePlugin({
      org: "zipy-0f",
      project: "node",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        // Keep maps until post-build New Relic upload runs, then delete there.
        filesToDeleteAfterUpload: [],
      },
    }),
  ],
});