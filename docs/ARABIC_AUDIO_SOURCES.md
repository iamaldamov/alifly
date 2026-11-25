# ALIFLY — Arabic pronunciation audio sources

## Individual letter names: free male neural voice

The 28 individual Arabic letter-name samples are generated during the GitHub Actions build with the open-source Piper speech engine.

- Voice: Kareem, one male Arabic voice
- Voice language/accent: Arabic (Jordan, ar_JO)
- Input: the vowelled letter names from `src/data/arabic-letter-names.json`, for example `أَلِف` and `بَاء`
- Output: 22.05 kHz, mono, 16-bit WAV files in `public/audio/letters/`
- Learner runtime: ordinary static WAV playback; no speech API, account, paid service, or TTS model download is required in the learner's browser
- Engine: https://github.com/OHF-Voice/piper1-gpl
- Engine license: GPL-3.0-or-later (the engine is used by CI to generate files and is not bundled into the learner-facing site)
- Voice model: https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/ar/ar_JO/kareem/medium
- Voice repository metadata: MIT
- Model files are downloaded by GitHub Actions and are not shipped to the learner's browser

### Voice-model provenance and licensing caution

The model card lists the dataset license as "See URL" and states that Kareem was fine-tuned from the U.S. English Lessac medium voice. Piper's own licensing guidance explains that training ancestry can carry restrictions: the Lessac Blizzard 2013 corpus is limited to research and exploration of speech technologies, and Piper does not grant additional rights over voice models or their training data.

For that reason, do not interpret the repository's MIT metadata as a complete commercial-use clearance. Treat this voice as **not cleared for commercial/monetized use** unless the relevant dataset and model rights are independently confirmed. The project should revisit this choice before adding paid features, ads, or other monetization around this audio.

References:
- Kareem model card: https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/ar/ar_JO/kareem/medium/MODEL_CARD
- Piper voice licensing guidance: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md
- Lessac Blizzard 2013 license: https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html

The voice is a Jordanian Arabic model, not a verified Modern Standard Arabic studio recording. It is used consistently for all 28 letter names. A qualified Arabic teacher should review the samples before ALIFLY describes them as teacher-approved.

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
