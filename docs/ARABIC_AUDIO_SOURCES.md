# ALIFLY — Arabic pronunciation audio sources

## Individual letter names: on-device neural speech

ALIFLY now generates the 28 individual letter names in the learner's browser using **NabraTTS** and the Nabra-7M-Distill neural Arabic voice.

- Language: Modern Standard Arabic (MSA)
- Voice: one synthetic female MSA voice
- Input: Arabic letter names with tashkeel (diacritics), such as `أَلِف` and `بَاء`
- Runtime: ONNX Runtime Web; WebGPU where available, otherwise WebAssembly
- Model download: approximately 16 MB using the FP16 build
- Caching: model and voice are cached in browser Cache Storage after the first load
- Service: no paid API key or server-side request is required for synthesis
- Package / model license: Apache-2.0
- Package: https://github.com/Oddadmix/nabra-tts
- Model: https://huggingface.co/oddadmix/Nabra-7M-Distill

The voice is synthetic, not a human recording and not teacher-certified. Nabra expects diacritized input for its best pronunciation; ALIFLY passes the vowelled letter names from its Arabic name map. The audio is generated locally on first listen; users need an internet connection for the initial model download. After the assets have been cached, subsequent synthesis can run offline, subject to browser cache retention.

### Third-party notice

The NabraTTS package documents its application code and model as Apache-2.0 and its bundled espeak-ng WebAssembly phonemizer as GPL-3.0-or-later. ALIFLY must retain the applicable third-party notices and license information when distributing this runtime. See the package's `THIRD_PARTY_NOTICES.md` and source repository before making any separate commercial distribution.

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
