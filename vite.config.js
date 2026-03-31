import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Vite config executes in Node; eslint's browser env doesn't define `process`.
// eslint-disable-next-line no-undef
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  build: {
    // Use visible sourcemaps so localhost stack traces resolve to original file names.
    sourcemap: true,
    // Avoid optional terser dependency on CI; keep bundles readable for debugging.
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
      authToken: SENTRY_AUTH_TOKEN,
      sourcemaps: {
        // Keep maps until post-build New Relic upload runs, then delete there.
        filesToDeleteAfterUpload: [],
      },
    }),
  ],
});