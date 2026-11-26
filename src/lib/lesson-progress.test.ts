import { describe, expect, it } from "vitest";
import { normalizeCompletedLessonIds, normalizeDailyLessonIds } from "./lesson-progress";

describe("lesson progress normalization", () => {
  it("preserves the new reading-foundation lesson IDs 9–13", () => {
    expect(normalizeCompletedLessonIds([6, 7, 8, 9, 10, 11, 12, 13])).toEqual([
      6, 7, 8, 9, 10, 11, 12, 13,
    ]);
    expect(normalizeDailyLessonIds([9, 11, 13])).toEqual([9, 11, 13]);
  });

  it("preserves the new level 3 sentence lesson IDs 38–39", () => {
    expect(normalizeCompletedLessonIds([35, 36, 37, 38, 39])).toEqual([35, 36, 37, 38, 39]);
    expect(normalizeDailyLessonIds([38, 39])).toEqual([38, 39]);
  });

  it("keeps the legacy alphabet progress migration", () => {
    expect(normalizeCompletedLessonIds([1, 2, 3, 4, 5])).toEqual([
      20, 21, 22, 23, 24, 25, 26, 27, 28,
    ]);
  });

  it("keeps migrated vocabulary and alphabet IDs alongside new lessons", () => {
    expect(normalizeCompletedLessonIds([20, 35, 9, 13, 35])).toEqual([
      20, 35, 9, 13,
    ]);
  });

  it("rejects malformed, fractional, and unsupported IDs", () => {
    expect(normalizeCompletedLessonIds(null)).toEqual([]);
    expect(normalizeCompletedLessonIds([9.5, "10", 0, 14, 99])).toEqual([]);
  });
});
