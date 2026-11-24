# ALIFLY — Arabic pronunciation audio sources

## Individual letter names: generated neural voice

The 28 individual Arabic letter-name samples are generated during the GitHub Actions site build using **Nabra-7M-Distill** in the NabraTTS project.

- Language: Modern Standard Arabic (MSA)
- Voice: one synthetic female MSA voice, consistent across all 28 letter names
- Input: Arabic letter names with tashkeel (diacritics), for example `أَلِف` and `بَاء`
- Output: 24 kHz mono WAV files stored in `public/audio/letters/` in the build workspace and copied into the deployed site
- Runtime for learners: ordinary static WAV playback; no TTS model, external speech API, or 16 MB model download is required in the learner's browser
- Model: https://huggingface.co/oddadmix/Nabra-7M-Distill-ONNX
- Nabra source and model repository: https://github.com/Oddadmix/nabra-tts
- Model license: Apache-2.0

The samples are AI-generated, not human recordings, and are not a substitute for teacher-guided pronunciation or tajwīd instruction. The model expects diacritized text; ALIFLY supplies vowelled letter names from the shared manifest at `src/data/arabic-letter-names.json`.

### Build-time third-party notices

The Nabra build project documents its bundled eSpeak NG WebAssembly phonemizer as GPL-3.0-or-later, ONNX Runtime Web as MIT, and its model as Apache-2.0. The Nabra source/runtime is fetched and run during GitHub Actions to generate audio files; the Nabra JavaScript/WebAssembly runtime is **not included in the learner-facing site bundle**. The generated output files are WAV audio, not program code. Retain this source/licence record for the build process and review the upstream notices if the generation method changes.

Pinned Nabra source commit used by GitHub Actions: `16b5281ce61993df3526740990cf845a3f3036f4`.

## Whole alphabet reference (human recording)

- Recording: Arabic alphabet (31s, 80kbps).ogg
- Speaker / creator: M. Abuhelwa
- Description: Egyptian Arabic speaker reciting the alphabet
- License: dedicated to the public domain by the author
- Source page: https://commons.wikimedia.org/wiki/File:Arabic_alphabet_(31s,_80kbps).ogg
- Direct MP3 transcode: https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ef/Arabic_alphabet_%2831s%2C_80kbps%29.ogg/Arabic_alphabet_%2831s%2C_80kbps%29.ogg.mp3

This recording is offered as a full-alphabet listening reference. It is not an individual isolated recording for each letter.

## Pedagogical limitations

- Letter-name audio is not the same as isolated consonant phonemes paired with fatḥa, kasra, and ḍamma.
- The simplified SVG diagrams show broad articulation areas and tongue posture. They are study aids, not precise anatomical or phonetic measurements.
- A qualified Arabic / tajwīd teacher should review the pronunciations and articulation descriptions before the material is described as teacher-approved.
