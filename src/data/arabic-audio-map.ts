export type ArabicAudioEntry = {
  character: string;
  slug: string;
};

export type ArabicAudioSampleType = "letter" | "syllable";

export type ArabicAudioSample = {
  url: string;
  type: ArabicAudioSampleType;
};

/**
 * Build exact-match audio URLs. Diacritics are intentionally preserved:
 * a syllable must never fall back to a letter-name recording.
 */
export function buildArabicAudioMap(
  entries: ArabicAudioEntry[],
  baseUrl: string,
  folder: "letters" | "syllables",
): Record<string, string> {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return Object.fromEntries(
    entries.map(({ character, slug }) => [
      character,
      `${base}audio/${folder}/${slug}.wav`,
    ]),
  );
}

export function resolveArabicAudioSample(
  character: string,
  letterAudio: Record<string, string>,
  syllableAudio: Record<string, string>,
): ArabicAudioSample | null {
  const syllableUrl = syllableAudio[character];
  if (syllableUrl) return { url: syllableUrl, type: "syllable" };

  const letterUrl = letterAudio[character];
  if (letterUrl) return { url: letterUrl, type: "letter" };

  return null;
}
