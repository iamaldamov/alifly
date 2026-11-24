import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryItem } from "./engine";
import { loadMemoryState, memoryStorageKey, parseMemoryState, saveMemoryState } from "./storage";
import { EMPTY_MEMORY_STATE } from "./types";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

describe("memory storage", () => {
  beforeEach(() => vi.stubGlobal("localStorage", new MemoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it("isolates guest and signed-in account keys without changing existing key formats", () => {
    expect(memoryStorageKey(null)).toBe("alifly-memory:v1:guest");
    expect(memoryStorageKey("user-a")).toBe("alifly-memory:v1:user-a");
    expect(memoryStorageKey(null)).not.toBe(memoryStorageKey("guest"));
    expect(memoryStorageKey("user-a")).not.toBe(memoryStorageKey("user-b"));
    expect(memoryStorageKey(" user-a ")).toBe(memoryStorageKey("user-a"));
  });

  it("round-trips separate user states", () => {
    const guestItem = createMemoryItem({ id: "guest-item", contentId: "g", contentType: "lesson_question", skill: "recall", now: 1 });
    const userItem = createMemoryItem({ id: "user-item", contentId: "u", contentType: "lesson_question", skill: "recognition", now: 2 });

    expect(saveMemoryState(null, { ...EMPTY_MEMORY_STATE, items: [guestItem] })).toBe(true);
    expect(saveMemoryState("user-a", { ...EMPTY_MEMORY_STATE, items: [userItem] })).toBe(true);
    expect(loadMemoryState(null).items.map((item) => item.id)).toEqual(["guest-item"]);
    expect(loadMemoryState("user-a").items.map((item) => item.id)).toEqual(["user-item"]);
    expect(loadMemoryState("user-b").items).toEqual([]);
  });

  it("returns an empty state for malformed or unsupported data", () => {
    expect(parseMemoryState("{broken").items).toEqual([]);
    expect(parseMemoryState(JSON.stringify({ schemaVersion: 999, items: [], recentEvents: [] })).items).toEqual([]);
    expect(parseMemoryState("x".repeat(1_500_001)).items).toEqual([]);
  });

  it("filters invalid records and bounds review history", () => {
    const valid = createMemoryItem({ id: "valid", contentId: "valid", contentType: "lesson_question", skill: "recall", now: 1 });
    const events = Array.from({ length: 505 }, (_, index) => ({
      id: `event-${index}`, itemId: valid.id, reviewedAt: index, grade: "good",
      responseTimeMs: null, usedHint: false, errorType: null,
    }));
    const parsed = parseMemoryState(JSON.stringify({
      schemaVersion: 1, updatedAt: 10, items: [valid, { id: "invalid" }], recentEvents: events,
    }));

    expect(parsed.items.map((item) => item.id)).toEqual(["valid"]);
    expect(parsed.recentEvents).toHaveLength(500);
    expect(parsed.recentEvents[0].id).toBe("event-5");
  });

  it("refuses an oversized write without overwriting valid saved data", () => {
    const key = memoryStorageKey(null);
    localStorage.setItem(key, "keep-this");
    const oversized = createMemoryItem({
      id: "x".repeat(1_500_001), contentId: "large", contentType: "lesson_question", skill: "recall", now: 1,
    });

    expect(saveMemoryState(null, { ...EMPTY_MEMORY_STATE, items: [oversized] })).toBe(false);
    expect(localStorage.getItem(key)).toBe("keep-this");
  });
});
