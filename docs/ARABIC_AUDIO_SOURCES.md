# ALIFLY — Arabic pronunciation audio sources

## Individual letter names and basic harakat syllables: SILMA TTS v1

This draft generates 28 individual letter-name clips and 9 short syllable clips for the three harakat lessons. The browser plays static WAV files; it does not call a paid API or download the TTS model for learners.

- Model: SILMA TTS v1; the upstream project describes support for Arabic Fusha/MSA and tashkeel
- Model weights: Apache-2.0
- Inference package: `silma-tts==1.0.5`; upstream code: MIT
- Reference recording: `silma-ref-voice-commercial.wav`
- Reference recording source: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo
- Pinned reference-file revision: `ef964ebeb35684e7a02a44b9aa8f26c42c1a3bb2`
- Reference-file SHA-256: `1c2e349fe42bf562932c00a51001e94970d3c210128e6a1ade89bb18148bd6ec`
- Reference transcript supplied by the official demo: `ويدقق النظر في القرآن الكريم وسائر الكتب السماوية ويتبع مسالك الرسل العظام عليهم الصلاة والسلام.`
- Letter input: vowelled names from `src/data/arabic-letter-names.json`
- Syllable input: the exact nine examples already present in the three harakat lessons, from `src/data/arabic-syllables.json`
- Output: 24 kHz, mono, 16-bit PCM WAV files in `public/audio/letters/` and `public/audio/syllables/`
- Learner runtime: static audio only; no external TTS request or subscription

### Voice provenance and publication gate

The model weights are Apache-2.0, but that license does not by itself grant rights to clone or use a reference speaker's voice. SILMA's own model documentation says to clone only voices for which explicit, documented permission exists and to disclose AI-generated speech.

The official demo exposes a file named `silma-ref-voice-commercial.wav`; this branch pins its revision and verifies its SHA-256. The public file name and availability are useful provenance, but the demo README does not provide a separate speaker consent statement. Therefore this PR must remain a **Draft** and these generated files must not be deployed until the reference speaker's consent/rights are independently confirmed.

- SILMA model repository and license: https://github.com/SILMA-AI/silma-tts
- Official model card: https://huggingface.co/silma-ai/silma-tts
- Exact reference recording: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo/blob/ef964ebeb35684e7a02a44b9aa8f26c42c1a3bb2/silma-ref-voice-commercial.wav

All generated samples are synthetic speech, not human recordings. They must be labelled as AI-generated and must not be described as teacher-approved until a qualified Arabic teacher has reviewed the individual clips. The demo does not officially specify the reference speaker's gender; the previously approved sample sounded male to the project owner, but this is not a verified voice metadata field.

### Build and validation

The build script:
- validates exactly 28 letter-name entries and 9 syllable entries;
- preserves each supplied Arabic string, including its diacritics (SILMA's default final-word normalizer is bypassed for these isolated samples because it otherwise changes a final short-vowel mark to sukūn);
- verifies the pinned reference audio hash before synthesis;
- checks WAV format, sample rate, mono channel count, bit depth, duration, and non-silent output;
- rejects clipped samples (peak at or above 0.98), near-silent clips (RMS below 0.02), leading silence above 0.20 s, trailing silence above 0.35 s, or clips with less than 35% active 10 ms frames;
- uploads a short-lived artifact for human listening review.

The successful artifact from [GitHub Actions run 45896582648](https://github.com/iamaldamov/alifly/actions/runs/45896582648) contains all 37 expected files. An offline metadata/signal check found 24 kHz mono files, durations from approximately 0.21 to 0.59 seconds, peak levels below 0.84, and no empty or silent files.

These are technical signal checks only. They do not establish correct makhraj, phonetic accuracy, correct letter-name pronunciation, or teaching quality. A qualified Arabic teacher must review the clips before publication.

## Whole alphabet reference (human recording)

- Recording: Arabic alphabet (31s, 80kbps).ogg
- Speaker / creator: M. Abuhelwa
- Description: Egyptian Arabic speaker reciting the alphabet
- License: dedicated to the public domain by the author
- Source page: https://commons.wikimedia.org/wiki/File:Arabic_alphabet_(31s,_80kbps).ogg
- Direct MP3 transcode: https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ef/Arabic_alphabet_%2831s%2C_80kbps%29.ogg/Arabic_alphabet_%2831s%2C_80kbps%29.ogg.mp3

This is one human full-alphabet reference recording, not separate isolated samples for each letter or syllable.

## Pedagogical limitations

- Letter-name audio is not the same as an isolated consonant phoneme.
- The nine generated syllables cover only the examples already taught in the fatha, kasra, and damma lessons. They do not cover every Arabic letter with every vowel.
- The articulation diagrams are study aids, not precise anatomical or phonetic measurements.
- A qualified Arabic / tajwīd teacher should review pronunciation and articulation descriptions before the material is described as teacher-approved.
