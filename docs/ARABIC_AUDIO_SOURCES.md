# ALIFLY — Arabic pronunciation audio sources

## Individual Arabic letter names: SILMA TTS v1

ALIFLY generates 28 separate static audio files during the GitHub Actions build. The browser plays these local WAV files; it does not call an external speech API or download the TTS model for learners.

- Model: SILMA TTS v1, bilingual Arabic/English, with MSA/Fusha support
- Model weights: Apache-2.0
- Inference package: `silma-tts==1.0.5`; upstream code is MIT-licensed
- Reference recording: `silma-ref-voice-commercial.wav`
- Reference recording source: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo
- Pinned reference-file revision: `ef964ebeb35684e7a02a44b9aa8f26c42c1a3bb2`
- Reference-file SHA-256: `1c2e349fe42bf562932c00a51001e94970d3c210128e6a1ade89bb18148bd6ec`
- Reference transcript supplied by the official demo: `ويدقق النظر في القرآن الكريم وسائر الكتب السماوية ويتبع مسالك الرسل العظام عليهم الصلاة والسلام.`
- Input: the vowelled Arabic letter names from `src/data/arabic-letter-names.json`
- Output: one 24 kHz, mono, 16-bit PCM WAV file per letter in `public/audio/letters/`
- Runtime for learners: ordinary static WAV playback; no TTS API, account, or paid service is required

### Reference voice and licensing

SILMA's official model README distinguishes its demonstration reference voice from the commercially designated recording. It says the default demo voice is not for commercial use, and specifically identifies `silma-ref-voice-commercial.wav` as a reference recording that may be used for commercial use cases. ALIFLY pins that exact file revision and verifies its SHA-256 before generation, rather than relying on a mutable URL or an unverified replacement.

- Official model repository and license details: https://github.com/SILMA-AI/silma-tts
- Official model card: https://huggingface.co/silma-ai/silma-tts
- Exact reference recording: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo/blob/main/silma-ref-voice-commercial.wav

The reference file is used only as a voice/style prompt during generation; it is not shipped to learners. The generated files are AI-generated speech. ALIFLY should identify them as AI-generated and must not describe them as teacher-approved until a qualified Arabic teacher has reviewed every letter.

### Build and validation

The build script loads the open model on CPU, uses the pinned reference recording, and creates each letter clip independently. It checks that the manifest has exactly 28 unique letters and filenames, that every WAV is non-empty, and that all outputs are mono, 24 kHz, 16-bit PCM with a plausible duration. The workflow then verifies that exactly 28 WAV files reached the production build and uploads a short-lived artifact for listening review.

Technical checks do not establish correct makharij, tajwīd, or pedagogical quality. A qualified Arabic teacher should review the 28 files before publication.

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
