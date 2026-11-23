import { describe, expect, it } from "vitest";
import { createMemoryItem, reviewMemoryItem, appendReviewResult } from "./engine";
import { getMemoryInsights } from "./analytics";
import { EMPTY_MEMORY_STATE } from "./types";

describe("memory insights", () => {
  it("calculates due, weak, reviewed, and recent accuracy metrics", () => {
    const initial = createMemoryItem({
      id: "card", contentId: "card", contentType: "lesson_question", skill: "recall", now: 1_000,
    });
    const failed = reviewMemoryItem(initial, { grade: "again", reviewedAt: 2_000, errorType: "dots" }, "fail");
    const passed = reviewMemoryItem(failed.item, { grade: "good", reviewedAt: 3_000 }, "pass");
    const state = appendReviewResult(
      appendReviewResult(EMPTY_MEMORY_STATE, failed),
      passed,
    );

    const insights = getMemoryInsights(state, 4_000);
    expect(insights.totalItems).toBe(1);
    expect(insights.dueItems).toBe(0);
    expect(insights.weakItems).toBe(1);
    expect(insights.reviewedItems).toBe(1);
    expect(insights.accuracyPercent).toBe(50);
    expect(insights.skillCounts[0]).toMatchObject({ skill: "recall", count: 1, accuracyPercent: 50 });
  });
});
