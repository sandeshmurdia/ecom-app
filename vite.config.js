import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
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
      // Use a safe lookup to avoid ESLint `no-undef` in ESM config environments.
      // Sentry plugin will no-op if no token is provided (typical for local/dev).
      authToken: globalThis?.process?.env?.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        // Keep maps until post-build New Relic upload runs, then delete there.
        filesToDeleteAfterUpload: [],
      },
    }),
  ],
});