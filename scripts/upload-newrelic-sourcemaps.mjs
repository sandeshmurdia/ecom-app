// import fs from "node:fs/promises";
// import path from "node:path";
// import { createRequire } from "node:module";

// const require = createRequire(import.meta.url);
// const { publishSourcemap } = require("@newrelic/publish-sourcemap");

// // Keep default in sync with Vite outDir so postbuild always finds generated maps.
// const DEFAULT_MAPS_DIR = path.resolve("build/assets");

// function asBoolean(value, defaultValue) {
//   if (value == null || value === "") return defaultValue;
//   return String(value).toLowerCase() !== "false";
// }

// function getRuntimeConfig() {
//   return {
//     applicationId:
//       process.env.NEW_RELIC_APPLICATION_ID || process.env.APPLICATION_ID || "",
//     apiKey: process.env.NEW_RELIC_API_KEY || process.env.NR_API_KEY || "",
//     assetUrlPrefix: (process.env.NEW_RELIC_ASSET_URL_PREFIX || "").replace(
//       /\/+$/,
//       ""
//     ),
//     releaseName: process.env.NEW_RELIC_RELEASE_NAME || process.env.RELEASE_NAME,
//     releaseId: process.env.NEW_RELIC_RELEASE_ID,
//     repoUrl: process.env.NEW_RELIC_REPO_URL,
//     buildCommit: process.env.NEW_RELIC_BUILD_COMMIT,
//     mapsDir: path.resolve(process.env.NEW_RELIC_SOURCEMAP_DIR || DEFAULT_MAPS_DIR),
//     deleteAfterUpload: asBoolean(process.env.NEW_RELIC_DELETE_SOURCEMAPS, true),
//   };
// }

// async function collectMapFiles(dirPath) {
//   const results = [];
//   const entries = await fs.readdir(dirPath, { withFileTypes: true });

//   for (const entry of entries) {
//     const fullPath = path.join(dirPath, entry.name);
//     if (entry.isDirectory()) {
//       results.push(...(await collectMapFiles(fullPath)));
//       continue;
//     }

//     if (entry.isFile() && entry.name.endsWith(".js.map")) {
//       results.push(fullPath);
//     }
//   }

//   return results;
// }

// function publishOneMap(payload) {
//   return new Promise((resolve, reject) => {
//     publishSourcemap(payload, (error) => {
//       if (error) {
//         reject(error);
//         return;
//       }
//       resolve();
//     });
//   });
// }

// function redactUploadError(error) {
//   // Prevent API key/header leakage while preserving enough signal for root-cause debugging.
//   return {
//     message: error?.message || "Unknown error",
//     status: error?.status || error?.response?.status,
//     responseText: error?.response?.text || error?.text,
//     method: error?.response?.error?.method,
//     path: error?.response?.error?.path,
//   };
// }

// async function uploadNewRelicSourcemaps() {
//   const config = getRuntimeConfig();
//   const missing = [];

//   if (!config.applicationId) missing.push("NEW_RELIC_APPLICATION_ID");
//   if (!config.apiKey) missing.push("NEW_RELIC_API_KEY");
//   if (!config.assetUrlPrefix) missing.push("NEW_RELIC_ASSET_URL_PREFIX");

//   if (missing.length > 0) {
//     // Keep local builds usable while making the skipped upload very explicit in CI logs.
//     console.warn(
//       `[newrelic-sourcemaps] Skipping upload because required env vars are missing: ${missing.join(
//         ", "
//       )}`
//     );
//     return;
//   }

//   let mapFiles = [];
//   try {
//     mapFiles = await collectMapFiles(config.mapsDir);
//   } catch (error) {
//     if (error?.code === "ENOENT") {
//       console.warn(
//         `[newrelic-sourcemaps] Skipping upload because maps directory does not exist: ${config.mapsDir}`
//       );
//       return;
//     }
//     throw error;
//   }

//   if (mapFiles.length === 0) {
//     console.warn(
//       `[newrelic-sourcemaps] No .js.map files found in ${config.mapsDir}; nothing to upload.`
//     );
//     return;
//   }

//   console.log(
//     `[newrelic-sourcemaps] Uploading ${mapFiles.length} source map(s) from ${config.mapsDir}`
//   );

//   for (const mapFile of mapFiles) {
//     const relativeMapPath = path.relative(config.mapsDir, mapFile);
//     const javascriptAssetPath = relativeMapPath.replace(/\.map$/, "");
//     const javascriptUrl = `${config.assetUrlPrefix}/${javascriptAssetPath.split(path.sep).join("/")}`;

//     await publishOneMap({
//       sourcemapPath: mapFile,
//       javascriptUrl,
//       applicationId: config.applicationId,
//       apiKey: config.apiKey,
//       releaseName: config.releaseName,
//       releaseId: config.releaseId,
//       repoUrl: config.repoUrl,
//       buildCommit: config.buildCommit,
//     });

//     console.log(`[newrelic-sourcemaps] Uploaded map for ${javascriptUrl}`);

//     // Delete sourcemaps after successful upload to avoid shipping them publicly.
//     if (config.deleteAfterUpload) {
//       await fs.unlink(mapFile);
//       console.log(`[newrelic-sourcemaps] Deleted local map ${mapFile}`);
//     }
//   }

//   console.log("[newrelic-sourcemaps] Upload finished successfully.");
// }

// uploadNewRelicSourcemaps().catch((error) => {
//   console.error("[newrelic-sourcemaps] Upload failed:", redactUploadError(error));
//   process.exitCode = 1;
// });
