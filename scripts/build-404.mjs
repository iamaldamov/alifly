import { access, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const indexFile = resolve("dist/index.html");
const fallbackFile = resolve("dist/404.html");

await access(indexFile);
await copyFile(indexFile, fallbackFile);
console.log("ALIFLY: generated GitHub Pages 404.html SPA fallback.");
