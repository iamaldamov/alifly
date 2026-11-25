import { describe, expect, it } from "vitest";
import syllables from "./arabic-syllables.json";

describe("Arabic syllable audio manifest", () => {
  it("contains the nine syllables already taught in the three harakat lessons", () => {
    expect(syllables).toHaveLength(9);
    expect(new Set(syllables.map((item) => item.character)).size).toBe(9);
    expect(new Set(syllables.map((item) => item.slug)).size).toBe(9);
  });

  it("keeps each generated clip text identical to the existing lesson example", () => {
    for (const item of syllables) {
      expect(item.text).toBe(item.character);
      expect(item.character).toMatch(/[\u064B-\u065F\u0670]/);
    }
  });
});
