import { describe, expect, it } from "vitest";
import { arabicReadingLessons } from "./arabic-reading-lessons";

describe("Arabic reading-foundation lessons", () => {
  it("adds five sequential lessons after the three short-vowel lessons", () => {
    expect(arabicReadingLessons.map((lesson) => lesson.id)).toEqual([9, 10, 11, 12, 13]);
  });

  it("covers joining, sukun, long vowels, tanwin, and shadda", () => {
    expect(arabicReadingLessons.map((lesson) => lesson.title)).toEqual([
      "Соединяем буквы: первое слово",
      "Сукун: согласная без краткой гласной",
      "Долгие гласные",
      "Танвин: окончания -un, -in и -an",
      "Шадда: удвоенная согласная",
    ]);
  });

  it("provides at least three answerable practice questions per lesson", () => {
    for (const lesson of arabicReadingLessons) {
      expect(lesson.questions.length).toBeGreaterThanOrEqual(3);
      for (const question of lesson.questions) {
        expect(question.options).toContain(question.correct);
        expect(question.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it("keeps Arabic reading examples and RTL stimuli explicit", () => {
    const joining = arabicReadingLessons[0];
    expect(joining.letters.some((item) => item.character === "كَتَبَ")).toBe(true);
    expect(joining.questions[0].stimulus).toBe("كَتَبَ");
    expect(joining.questions[1].stimulusDir).toBe("rtl");
  });
});
