import { describe, expect, it } from "vitest";
import {
  buildArabicAudioMap,
  resolveArabicAudioSample,
} from "./arabic-audio-map";

describe("Arabic audio map", () => {
  const letters = buildArabicAudioMap(
    [{ character: "ب", slug: "ba" }],
    "/alifly/",
    "letters",
  );
  const syllables = buildArabicAudioMap(
    [{ character: "بَ", slug: "ba-fatha" }],
    "/alifly/",
    "syllables",
  );

  it("resolves a vowelled syllable to its own clip", () => {
    expect(resolveArabicAudioSample("بَ", letters, syllables)).toEqual({
      url: "/alifly/audio/syllables/ba-fatha.wav",
      type: "syllable",
    });
  });

  it("keeps a bare letter mapped to its letter-name clip", () => {
    expect(resolveArabicAudioSample("ب", letters, syllables)).toEqual({
      url: "/alifly/audio/letters/ba.wav",
      type: "letter",
    });
  });

  it("does not strip diacritics or substitute the wrong recording", () => {
    expect(resolveArabicAudioSample("بِ", letters, syllables)).toBeNull();
  });
});
