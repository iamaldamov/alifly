import {
  EMPTY_MEMORY_STATE,
  MEMORY_SCHEMA_VERSION,
  type MemoryItem,
  type MemoryReviewEvent,
  type MemoryState,
} from "./types";

const STORAGE_PREFIX = "alifly-memory";
const MAX_STORAGE_CHARS = 1_500_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMemoryItem(value: unknown): value is MemoryItem {
  if (!isRecord(value)) return false;
  return value.schemaVersion === MEMORY_SCHEMA_VERSION
    && typeof value.id === "string"
    && typeof value.contentId === "string"
    && typeof value.contentType === "string"
    && typeof value.skill === "string"
    && typeof value.dueAt === "number" && Number.isFinite(value.dueAt)
    && typeof value.intervalDays === "number" && Number.isFinite(value.intervalDays)
    && typeof value.repetitions === "number" && Number.isInteger(value.repetitions)
    && typeof value.easeFactor === "number" && Number.isFinite(value.easeFactor)
    && typeof value.lapseCount === "number" && Number.isInteger(value.lapseCount)
    && (value.lastReviewedAt === null || (typeof value.lastReviewedAt === "number" && Number.isFinite(value.lastReviewedAt)))
    && typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
    && typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt);
}

function isMemoryEvent(value: unknown): value is MemoryReviewEvent {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.itemId === "string"
    && typeof value.reviewedAt === "number" && Number.isFinite(value.reviewedAt)
    && (value.grade === "again" || value.grade === "hard" || value.grade === "good" || value.grade === "easy")
    && (value.responseTimeMs === null || (typeof value.responseTimeMs === "number" && Number.isFinite(value.responseTimeMs)))
    && typeof value.usedHint === "boolean";
}

export function memoryStorageKey(userId: string | null): string {
  const scope = userId && userId.trim() ? userId.trim() : "guest";
  return `${STORAGE_PREFIX}:v${MEMORY_SCHEMA_VERSION}:${encodeURIComponent(scope)}`;
}

export function parseMemoryState(raw: string | null): MemoryState {
  if (!raw || raw.length > MAX_STORAGE_CHARS) return { ...EMPTY_MEMORY_STATE, items: [], recentEvents: [] };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== MEMORY_SCHEMA_VERSION
      || !Array.isArray(parsed.items) || !Array.isArray(parsed.recentEvents)) {
      return { ...EMPTY_MEMORY_STATE, items: [], recentEvents: [] };
    }

    return {
      schemaVersion: MEMORY_SCHEMA_VERSION,
      updatedAt: typeof parsed.updatedAt === "number" && Number.isFinite(parsed.updatedAt) ? parsed.updatedAt : 0,
      items: parsed.items.filter(isMemoryItem),
      recentEvents: parsed.recentEvents.filter(isMemoryEvent).slice(-500),
    };
  } catch {
    return { ...EMPTY_MEMORY_STATE, items: [], recentEvents: [] };
  }
}

/** Browser storage is optional; callers can keep the current session in memory if unavailable. */
export function loadMemoryState(userId: string | null): MemoryState {
  try {
    if (typeof localStorage === "undefined") return parseMemoryState(null);
    return parseMemoryState(localStorage.getItem(memoryStorageKey(userId)));
  } catch {
    return parseMemoryState(null);
  }
}

export function saveMemoryState(userId: string | null, state: MemoryState): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(memoryStorageKey(userId), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
