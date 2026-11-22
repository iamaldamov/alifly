import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputDir = resolve("dist");
const indexFile = resolve(outputDir, "index.html");
const fallbackFile = resolve(outputDir, "404.html");

await mkdir(dirname(fallbackFile), { recursive: true });
await copyFile(indexFile, fallbackFile);

console.log("ALIFLY: created dist/404.html for GitHub Pages SPA fallback.");
