import { describe, expect, it } from "vitest";
import { appendReviewResult, createMemoryItem, getDueMemoryItems, reviewMemoryItem } from "./engine";
import { EMPTY_MEMORY_STATE } from "./types";

const makeItem = (id = "item-1", now = 1_000) => createMemoryItem({
  id, contentId: id, contentType: "lesson_question", skill: "recognition", now,
});

describe("memory scheduling engine", () => {
  it("retries Again after ten minutes and records a lapse", () => {
    const result = reviewMemoryItem(makeItem(), {
      grade: "again", reviewedAt: 5_000, errorType: "dots",
    }, "event-1");

    expect(result.item.dueAt).toBe(605_000);
    expect(result.item.repetitions).toBe(0);
    expect(result.item.lapseCount).toBe(1);
    expect(result.item.lastErrorType).toBe("dots");
    expect(result.event.errorType).toBe("dots");
  });

  it("follows the successful interval ladder and caps at thirty days", () => {
    let item = makeItem();
    const intervals: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      const result = reviewMemoryItem(item, { grade: "good", reviewedAt: 10_000 + index }, `event-${index}`);
      item = result.item;
      intervals.push(item.intervalDays);
    }
    expect(intervals).toEqual([1, 3, 7, 14, 30, 30]);
  });

  it("adjusts Hard and Easy intervals and ease factor", () => {
    const initial = makeItem();
    const hard = reviewMemoryItem(initial, { grade: "hard", reviewedAt: 2_000 }, "hard");
    const easy = reviewMemoryItem(initial, { grade: "easy", reviewedAt: 2_000 }, "easy");

    expect(hard.item.intervalDays).toBe(2);
    expect(hard.item.easeFactor).toBeCloseTo(2.35);
    expect(easy.item.intervalDays).toBe(2);
    expect(easy.item.easeFactor).toBeCloseTo(2.6);
  });

  it("returns only due cards in due-date order, prioritizing lapses on ties", () => {
    const later = { ...makeItem("later"), dueAt: 300 };
    const lowPriority = { ...makeItem("low"), dueAt: 100, lapseCount: 0 };
    const highPriority = { ...makeItem("high"), dueAt: 100, lapseCount: 2 };
    const future = { ...makeItem("future"), dueAt: 2_000 };
    const state = { ...EMPTY_MEMORY_STATE, items: [later, lowPriority, future, highPriority] };

    expect(getDueMemoryItems(state, 1_000, 2).map((item) => item.id)).toEqual(["high", "low"]);
  });

  it("replaces an existing item and keeps only the latest 500 events", () => {
    const previous = makeItem();
    const reviewed = reviewMemoryItem(previous, { grade: "good", reviewedAt: 4_000 }, "new-event");
    const oldEvents = Array.from({ length: 500 }, (_, index) => ({
      id: `old-${index}`, itemId: previous.id, reviewedAt: index,
      grade: "good" as const, responseTimeMs: null, usedHint: false, errorType: null,
    }));
    const state = appendReviewResult({ ...EMPTY_MEMORY_STATE, items: [previous], recentEvents: oldEvents }, reviewed);

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(previous.id);
    expect(state.recentEvents).toHaveLength(500);
    expect(state.recentEvents[499].id).toBe("new-event");
  });
});
