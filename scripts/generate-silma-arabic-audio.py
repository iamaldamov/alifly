#!/usr/bin/env python3
"""Generate ALIFLY's 28 static Arabic letter-name clips with SILMA TTS v1."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path

import soundfile as sf
import torch
from silma_tts.api import SilmaTTS

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src/data/arabic-letter-names.json"
OUTPUT_DIR = ROOT / "public/audio/letters"
REFERENCE_AUDIO = Path(
    os.environ.get("SILMA_REFERENCE_AUDIO", "/tmp/silma-ref-voice-commercial.wav")
)
REFERENCE_SHA256 = "1c2e349fe42bf562932c00a51001e94970d3c210128e6a1ade89bb18148bd6ec"
REFERENCE_TEXT = (
    "ويدقق النظر في القرآن الكريم وسائر الكتب السماوية ويتبع مسالك الرسل العظام عليهم الصلاة والسلام."
)
EXPECTED_SAMPLE_RATE = 24000


def main() -> None:
    if not MANIFEST.is_file():
        raise FileNotFoundError(f"Missing letter manifest: {MANIFEST}")
    if not REFERENCE_AUDIO.is_file():
        raise FileNotFoundError(f"Missing SILMA reference audio: {REFERENCE_AUDIO}")

    reference_hash = hashlib.sha256(REFERENCE_AUDIO.read_bytes()).hexdigest()
    if reference_hash != REFERENCE_SHA256:
        raise RuntimeError(
            "SILMA reference audio SHA-256 mismatch; refusing to generate with an unexpected voice file."
        )

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if not isinstance(manifest, list) or len(manifest) != 28:
        raise ValueError("Expected exactly 28 Arabic letter-name entries.")

    characters = [item["character"] for item in manifest]
    slugs = [item["slug"] for item in manifest]
    if len(set(characters)) != 28 or len(set(slugs)) != 28:
        raise ValueError("Manifest contains duplicate Arabic letters or audio filenames.")

    # Limit CPU thread use on standard GitHub-hosted runners.
    torch.set_num_threads(min(4, os.cpu_count() or 1))

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Tashkeel is already present in the manifest. Disable optional normalizer
    # and automatic diacritization so the supplied letter names are preserved.
    tts = SilmaTTS(enable_normalizer=False, force_tashkeel=False)

    total_bytes = 0
    try:
        for index, item in enumerate(manifest):
            destination = OUTPUT_DIR / f"{item['slug']}.wav"
            tts.infer(
                ref_file=str(REFERENCE_AUDIO),
                ref_text=REFERENCE_TEXT,
                gen_text=item["name"],
                file_wave=str(destination),
                seed=20261125 + index,
                speed=1.0,
                normalize_numbers=False,
                force_tashkeel=False,
                nfe_step=16,
            )

            if not destination.is_file():
                raise RuntimeError(f"SILMA did not create audio for {item['character']}.")

            info = sf.info(str(destination))
            if (
                info.format != "WAV"
                or info.samplerate != EXPECTED_SAMPLE_RATE
                or info.channels != 1
                or info.subtype != "PCM_16"
                or not 0.2 <= info.duration <= 5.0
            ):
                raise RuntimeError(
                    f"Invalid audio for {item['character']} ({item['name']}): "
                    f"format={info.format}, rate={info.samplerate}, "
                    f"channels={info.channels}, subtype={info.subtype}, "
                    f"duration={info.duration:.2f}s"
                )

            audio, sample_rate = sf.read(str(destination), dtype="float32")
            if sample_rate != EXPECTED_SAMPLE_RATE or not audio.size:
                raise RuntimeError(f"Empty or invalid audio for {item['character']}.")
            if not (abs(audio).max() > 0.001):
                raise RuntimeError(f"Silent audio generated for {item['character']}.")

            size = destination.stat().st_size
            total_bytes += size
            print(
                f"Generated {item['character']} {item['name']}: "
                f"{info.duration:.2f}s, {size} bytes"
            )
    finally:
        del tts

    generated = sorted(OUTPUT_DIR.glob("*.wav"))
    if len(generated) != 28:
        raise RuntimeError(f"Expected 28 WAV files, found {len(generated)}.")

    print(
        f"Successfully generated and validated {len(generated)} SILMA clips "
        f"({total_bytes / 1024:.1f} KiB total)."
    )


if __name__ == "__main__":
    main()
