import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    // Use visible sourcemaps so localhost stack traces resolve to original file names.
    sourcemap: true,
    // Switch to terser so we can preserve function/class names for New Relic stack traces.
    minify: "terser",
    terserOptions: {
      keep_fnames: true,       // Preserves function names in stack traces
      keep_classnames: true,   // Preserves class names in stack traces
      compress: {
        drop_console: false,   // Keep console logs intact
      },
      mangle: {
        keep_fnames: true,     // Also prevent mangling of function names
      },
    },
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