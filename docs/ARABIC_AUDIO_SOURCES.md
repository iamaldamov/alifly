# ALIFLY — Arabic pronunciation audio sources

## Whole alphabet reference

- Recording: Arabic alphabet (31s, 80kbps).ogg
- Speaker / creator: M. Abuhelwa
- Description: Egyptian Arabic speaker reciting the alphabet
- License: dedicated to the public domain by the author
- Source page: https://commons.wikimedia.org/wiki/File:Arabic_alphabet_(31s,_80kbps).ogg
- Direct MP3 transcode: https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ef/Arabic_alphabet_%2831s%2C_80kbps%29.ogg/Arabic_alphabet_%2831s%2C_80kbps%29.ogg.mp3

The source page identifies the speaker, describes the recording, and records the public-domain dedication. This is an alphabet-level recording, not a separate isolated recording for each letter.

## Individual letter-name samples

The 28 short samples currently referenced in `src/data/arabic-letter-audio.ts` were generated as AI speech samples using the same clear voice style. They say the Arabic names of the letters with diacritics; they are not human recordings, phoneme-only demonstrations, or tajwīd instruction.

**Important hosting limitation:** these URLs currently point to the voice-generation service's public preview bucket (`mcp-preview` / `7d-public`). They are temporary preview assets, not durable project-owned media. Do not merge this audio implementation into production until the 28 files have been copied to stable project-controlled hosting (for example, versioned static files in this repository or another permanent public bucket) and verified with a browser playback test.

## Pedagogical limitations

- The speaker's full alphabet recording can be used as a listening reference.
- The simplified SVG diagrams show broad articulation areas and tongue posture. They are study aids, not precise anatomical or phonetic measurements.
- Letter-name recordings are not the same as isolated consonant phonemes with fatḥa, kasra, and ḍamma.
- Before labelling the material as teacher-approved, a qualified Arabic / tajwīd teacher should review the pronunciations and articulation descriptions.
