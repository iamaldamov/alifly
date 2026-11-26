import { describe, expect, it } from "vitest";
import { getMakhrajBaseLetter } from "./LetterMakhrajDiagram";

describe("articulation diagram letter selection", () => {
  it("recognizes a single Arabic consonant with optional vowel marks", () => {
    expect(getMakhrajBaseLetter("ب")).toBe("ب");
    expect(getMakhrajBaseLetter("فْ")).toBe("ف");
    expect(getMakhrajBaseLetter("لّ")).toBe("ل");
    expect(getMakhrajBaseLetter("ـتـ")).toBe("ت");
  });

  it("does not show a single-letter articulation diagram for words or long-vowel combinations", () => {
    expect(getMakhrajBaseLetter("كَتَبَ")).toBeNull();
    expect(getMakhrajBaseLetter("عِلْم")).toBeNull();
    expect(getMakhrajBaseLetter("بَا")).toBeNull();
    expect(getMakhrajBaseLetter("مُعَلِّمٌ")).toBeNull();
  });
});
