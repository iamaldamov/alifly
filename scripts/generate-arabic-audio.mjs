import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ttsRoot = resolve(process.argv[2] ?? "/tmp/nabra-tts");
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

const require = createRequire(pathToFileURL(join(ttsRoot, "package.json")));
const ortDirectory = dirname(require.resolve("onnxruntime-web")) + "/";
const { NabraTTS } = await import(pathToFileURL(join(ttsRoot, "dist/index.js")).href);

const tts = await NabraTTS.load({
  worker: false,
  dtype: "fp16",
  device: "wasm",
  cache: false,
  modelUrl: "https://huggingface.co/oddadmix/Nabra-7M-Distill-ONNX/resolve/main/onnx/model_fp16.onnx",
  voiceUrl: "https://huggingface.co/oddadmix/Nabra-7M-Distill-ONNX/resolve/main/voices/af_msa.bin",
  wasmPaths: pathToFileURL(ortDirectory).href,
});

await mkdir(outputDir, { recursive: true });
let totalBytes = 0;

try {
  for (const item of manifest) {
    const { audio, sampleRate } = await tts.generate(item.name, { speed: 0.92 });
    if (sampleRate !== 24000 || audio.length === 0 || !audio.every(Number.isFinite)) {
      throw new Error(`Invalid generated audio for ${item.character} (${item.name}).`);
    }

    const wav = Buffer.from(await tts.toWav(audio).arrayBuffer());
    const destination = join(outputDir, `${item.slug}.wav`);
    await writeFile(destination, wav);
    totalBytes += wav.byteLength;

    const seconds = (audio.length / sampleRate).toFixed(2);
    console.log(`Generated ${item.character} ${item.name}: ${seconds}s, ${wav.byteLength} bytes`);
  }
} finally {
  await tts.dispose();
}

console.log(`Generated ${manifest.length} letter clips (${(totalBytes / 1024).toFixed(1)} KB total).`);
