import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
// `process.env.*` is used for build-time configuration; declare `process` as a global for ESLint.
/* global process */
export default defineConfig({
  build: {
    // Use visible sourcemaps so localhost stack traces resolve to original file names.
    sourcemap: true,
    // Keep production bundles readable for debugging in browser and New Relic contexts.
    minify: false,
    // Keep original source content embedded in sourcemaps for New Relic de-minified stack traces.
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
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