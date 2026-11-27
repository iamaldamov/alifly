#!/usr/bin/env python3
"""Generate ALIFLY's 28 Arabic letter-name and 9 harakat syllable clips with SILMA TTS v1."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path

import soundfile as sf
import torch
from silma_tts.api import SilmaTTS
import silma_tts.infer.utils_infer as silma_infer

# SILMA's normalize_last_word() rewrites the final Arabic vowel mark to sukun.
# ALIFLY generates isolated letter names and isolated harakat syllables, where
# that rewrite changes the lesson target (for example بَ becomes بْ).
# Preserve the explicitly supplied, source-checked tashkeel for these clips.
silma_infer.normalize_last_word = lambda text: text

ROOT = Path(__file__).resolve().parents[1]
LETTER_MANIFEST = ROOT / "src/data/arabic-letter-names.json"
SYLLABLE_MANIFEST = ROOT / "src/data/arabic-syllables.json"
OUTPUT_ROOT = ROOT / "public/audio"
LETTER_OUTPUT = OUTPUT_ROOT / "letters"
SYLLABLE_OUTPUT = OUTPUT_ROOT / "syllables"
REFERENCE_AUDIO = Path(
    os.environ.get("SILMA_REFERENCE_AUDIO", "/tmp/silma-ref-voice-commercial.wav")
)
REFERENCE_SHA256 = "1c2e349fe42bf562932c00a51001e94970d3c210128e6a1ade89bb18148bd6ec"
REFERENCE_TEXT = (
    "ويدقق النظر في القرآن الكريم وسائر الكتب السماوية ويتبع مسالك الرسل العظام عليهم الصلاة والسلام."
)
EXPECTED_SAMPLE_RATE = 24000


def load_manifest(path: Path, expected_count: int, text_key: str) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Missing audio manifest: {path}")

    manifest = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(manifest, list) or len(manifest) != expected_count:
        raise ValueError(f"Expected exactly {expected_count} entries in {path.name}.")

    characters = [item.get("character") for item in manifest]
    slugs = [item.get("slug") for item in manifest]
    texts = [item.get(text_key) for item in manifest]
    if (
        any(not isinstance(value, str) or not value.strip() for value in characters + slugs + texts)
        or len(set(characters)) != expected_count
        or len(set(slugs)) != expected_count
        or any(not slug.replace("-", "").isalnum() for slug in slugs)
    ):
        raise ValueError(f"Invalid or duplicate entries in {path.name}.")

    return manifest


def validate_audio_signal(audio, sample_rate: int, label: str) -> dict[str, float]:
    """Reject technically broken clips; this does not assess phonetic correctness."""
    peak = float(abs(audio).max())
    rms = float((audio**2).mean() ** 0.5)
    frame_samples = max(1, int(sample_rate * 0.01))
    frame_rms = [
        float((audio[start : start + frame_samples] ** 2).mean() ** 0.5)
        for start in range(0, len(audio) - frame_samples + 1, frame_samples)
    ]
    active_frames = [index for index, value in enumerate(frame_rms) if value > 0.01]

    if peak >= 0.98:
        raise RuntimeError(f"Clipped audio for {label}: peak={peak:.3f}.")
    if rms < 0.02:
        raise RuntimeError(f"Audio is too quiet for {label}: RMS={rms:.3f}.")
    if not active_frames:
        raise RuntimeError(f"No active speech detected in audio for {label}.")

    leading_silence = active_frames[0] * frame_samples / sample_rate
    trailing_silence = (len(frame_rms) - 1 - active_frames[-1]) * frame_samples / sample_rate
    active_ratio = len(active_frames) / max(1, len(frame_rms))

    if leading_silence > 0.20 or trailing_silence > 0.35 or active_ratio < 0.35:
        raise RuntimeError(
            f"Suspicious silence in audio for {label}: "
            f"leading={leading_silence:.2f}s, trailing={trailing_silence:.2f}s, "
            f"active={active_ratio:.0%}."
        )

    return {
        "peak": peak,
        "rms": rms,
        "leading_silence": leading_silence,
        "trailing_silence": trailing_silence,
        "active_ratio": active_ratio,
    }


def synthesize_manifest(
    tts: SilmaTTS,
    manifest: list[dict[str, str]],
    output_dir: Path,
    text_key: str,
    seed_offset: int,
    min_duration: float,
) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    total_bytes = 0

    for index, item in enumerate(manifest):
        destination = output_dir / f"{item['slug']}.wav"
        text = item[text_key]
        tts.infer(
            ref_file=str(REFERENCE_AUDIO),
            ref_text=REFERENCE_TEXT,
            gen_text=text,
            file_wave=str(destination),
            seed=20261125 + seed_offset + index,
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
            or not min_duration <= info.duration <= 5.0
        ):
            raise RuntimeError(
                f"Invalid audio for {item['character']} ({text}): "
                f"format={info.format}, rate={info.samplerate}, "
                f"channels={info.channels}, subtype={info.subtype}, "
                f"duration={info.duration:.2f}s"
            )

        audio, sample_rate = sf.read(str(destination), dtype="float32")
        if sample_rate != EXPECTED_SAMPLE_RATE or not audio.size:
            raise RuntimeError(f"Empty or invalid audio for {item['character']}.")
        if not (abs(audio).max() > 0.001):
            raise RuntimeError(f"Silent audio generated for {item['character']}.")

        signal = validate_audio_signal(audio, sample_rate, item["character"])
        size = destination.stat().st_size
        total_bytes += size
        print(
            f"Generated {item['character']} {text}: {info.duration:.2f}s, {size} bytes; "
            f"peak={signal['peak']:.2f}, RMS={signal['rms']:.2f}, "
            f"active={signal['active_ratio']:.0%}"
        )

    generated = sorted(output_dir.glob("*.wav"))
    if len(generated) != len(manifest):
        raise RuntimeError(
            f"Expected {len(manifest)} WAV files in {output_dir}, found {len(generated)}."
        )

    return total_bytes


def main() -> None:
    if not REFERENCE_AUDIO.is_file():
        raise FileNotFoundError(f"Missing SILMA reference audio: {REFERENCE_AUDIO}")

    reference_hash = hashlib.sha256(REFERENCE_AUDIO.read_bytes()).hexdigest()
    if reference_hash != REFERENCE_SHA256:
        raise RuntimeError(
            "SILMA reference audio SHA-256 mismatch; refusing to generate with an unexpected voice file."
        )

    letters = load_manifest(LETTER_MANIFEST, 28, "name")
    syllables = load_manifest(SYLLABLE_MANIFEST, 9, "text")

    torch.set_num_threads(min(4, os.cpu_count() or 1))

    for directory in (LETTER_OUTPUT, SYLLABLE_OUTPUT):
        if directory.exists():
            shutil.rmtree(directory)

    # Supplied text already includes tashkeel. Do not invent or rewrite diacritics.
    tts = SilmaTTS(enable_normalizer=False, force_tashkeel=False)
    try:
        letter_bytes = synthesize_manifest(
            tts, letters, LETTER_OUTPUT, "name", seed_offset=0, min_duration=0.2
        )
        syllable_bytes = synthesize_manifest(
            tts, syllables, SYLLABLE_OUTPUT, "text", seed_offset=100, min_duration=0.1
        )
    finally:
        del tts

    print(
        f"Generated and validated 28 letter clips and 9 harakat syllable clips "
        f"({(letter_bytes + syllable_bytes) / 1024:.1f} KiB total)."
    )


if __name__ == "__main__":
    main()
