import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
// Vite config runs in Node; `process` is available at runtime, but ESLint's browser globals
// don't include it by default for this file.
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