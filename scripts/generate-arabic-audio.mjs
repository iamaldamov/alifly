import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";

const modelPath = resolve(
  process.argv[2] ?? "/tmp/alifly-piper/ar_JO-kareem-medium.onnx",
);
const manifestPath = resolve("src/data/arabic-letter-names.json");
const outputDir = resolve("public/audio/letters");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (!Array.isArray(manifest) || manifest.length !== 28) {
  throw new Error("Expected exactly 28 Arabic letter-name entries.");
}

const uniqueCharacters = new Set(manifest.map((item) => item.character));
const uniqueSlugs = new Set(manifest.map((item) => item.slug));
if (uniqueCharacters.size !== 28 || uniqueSlugs.size !== 28) {
  throw new Error("Arabic audio manifest contains duplicate letters or file names.");
}

try {
  await stat(modelPath);
  await stat(`${modelPath}.json`);
} catch {
  throw new Error(
    `Piper model or matching JSON config is missing: ${modelPath}`,
  );
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
let totalBytes = 0;

for (const item of manifest) {
  const destination = resolve(outputDir, `${item.slug}.wav`);
  const result = spawnSync(
    "python",
    [
      "-m",
      "piper",
      "-m",
      modelPath,
      "-f",
      destination,
      "--length-scale",
      "1.08",
      "--",
      item.name,
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  );

  if (result.status !== 0) {
    throw new Error(
      `Piper failed for ${item.character} (${item.name}):\n${result.stderr || result.stdout}`,
    );
  }

  const wav = await readFile(destination);
  if (
    wav.length <= 44 ||
    wav.toString("ascii", 0, 4) !== "RIFF" ||
    wav.toString("ascii", 8, 12) !== "WAVE" ||
    wav.readUInt32LE(24) !== 22050 ||
    wav.readUInt16LE(22) !== 1 ||
    wav.readUInt16LE(34) !== 16
  ) {
    throw new Error(`Invalid WAV output for ${item.character} (${item.name}).`);
  }

  totalBytes += wav.length;
  console.log(
    `Generated ${item.character} ${item.name}: ${(wav.length / 1024).toFixed(1)} KB`,
  );
}

console.log(
  `Generated and validated ${manifest.length} male Arabic letter clips (${(totalBytes / 1024).toFixed(1)} KB total).`,
);
