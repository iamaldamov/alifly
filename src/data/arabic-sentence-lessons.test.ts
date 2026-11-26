import { describe, expect, it } from "vitest";
import { arabicSentenceLessons } from "./arabic-sentence-lessons";

describe("Arabic sentence-reading lessons", () => {
  it("adds two sequential lessons after the first-word unit", () => {
    expect(arabicSentenceLessons.map((lesson) => lesson.id)).toEqual([38, 39]);
  });

  it("uses the reviewed beginner demonstrative examples", () => {
    const examples = arabicSentenceLessons.flatMap((lesson) => lesson.studyCards.map((card) => card.arabic));
    expect(examples).toContain("مَا هَٰذَا؟");
    expect(examples).toContain("هَٰذَا كِتَابٌ.");
    expect(examples).toContain("هَٰذَا بَابٌ.");
    expect(examples).toContain("هَٰذَا بَيْتٌ.");
    expect(examples).toContain("أَهَٰذَا مِفْتَاحٌ؟");
    expect(examples).toContain("نَعَمْ، هَٰذَا بَيْتٌ.");
    expect(examples).toContain("لا، هَٰذَا قَلَمٌ.");
  });

  it("keeps every practice answer selectable and every Arabic prompt RTL", () => {
    for (const lesson of arabicSentenceLessons) {
      expect(lesson.studyCards.length).toBeGreaterThanOrEqual(3);
      expect(lesson.questions.length).toBeGreaterThanOrEqual(4);
      for (const question of lesson.questions) {
        expect(question.options).toContain(question.correct);
        expect(question.explanation.length).toBeGreaterThan(10);
        if (question.stimulus) {
          expect(question.stimulusLang).toBe("ar");
          expect(question.stimulusDir).toBe("rtl");
        }
      }
    }
  });
});
