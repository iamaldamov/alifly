import {
  EMPTY_MEMORY_STATE,
  MEMORY_SCHEMA_VERSION,
  type MemoryContentType,
  type MemoryErrorType,
  type MemoryGrade,
  type MemoryItem,
  type MemoryReviewEvent,
  type MemorySkill,
  type MemoryState,
} from "./types";

const STORAGE_PREFIX = "alifly-memory";
const MAX_STORAGE_CHARS = 1_500_000;

const CONTENT_TYPES: MemoryContentType[] = ["letter", "vowel_mark", "syllable", "word", "phrase", "grammar_rule", "lesson_question"];
const SKILLS: MemorySkill[] = ["recognition", "recall", "pronunciation", "listening", "reading", "meaning", "grammar"];
const GRADES: MemoryGrade[] = ["again", "hard", "good", "easy"];
const ERROR_TYPES: MemoryErrorType[] = ["shape", "dots", "letter_name", "pronunciation", "listening", "meaning", "reading", "grammar", "attention", "unknown"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableEnum<T extends string>(value: unknown, values: T[]): value is T | null {
  return value === null || (typeof value === "string" && values.includes(value as T));
}

function isMemoryItem(value: unknown): value is MemoryItem {
  if (!isRecord(value)) return false;
  return value.schemaVersion === MEMORY_SCHEMA_VERSION
    && typeof value.id === "string" && value.id.length > 0
    && typeof value.contentId === "string" && value.contentId.length > 0
    && typeof value.contentType === "string" && CONTENT_TYPES.includes(value.contentType as MemoryContentType)
    && typeof value.skill === "string" && SKILLS.includes(value.skill as MemorySkill)
    && typeof value.dueAt === "number" && Number.isFinite(value.dueAt)
    && typeof value.intervalDays === "number" && Number.isFinite(value.intervalDays) && value.intervalDays >= 0
    && typeof value.repetitions === "number" && Number.isInteger(value.repetitions) && value.repetitions >= 0
    && typeof value.easeFactor === "number" && Number.isFinite(value.easeFactor) && value.easeFactor >= 1.3 && value.easeFactor <= 3
    && typeof value.lapseCount === "number" && Number.isInteger(value.lapseCount) && value.lapseCount >= 0
    && (value.lastReviewedAt === null || (typeof value.lastReviewedAt === "number" && Number.isFinite(value.lastReviewedAt)))
    && isNullableEnum(value.lastGrade, GRADES)
    && isNullableEnum(value.lastErrorType, ERROR_TYPES)
    && typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
    && typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt);
}

function isMemoryEvent(value: unknown): value is MemoryReviewEvent {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && value.id.length > 0
    && typeof value.itemId === "string" && value.itemId.length > 0
    && typeof value.reviewedAt === "number" && Number.isFinite(value.reviewedAt)
    && typeof value.grade === "string" && GRADES.includes(value.grade as MemoryGrade)
    && (value.responseTimeMs === null || (typeof value.responseTimeMs === "number" && Number.isFinite(value.responseTimeMs) && value.responseTimeMs >= 0))
    && typeof value.usedHint === "boolean"
    && isNullableEnum(value.errorType, ERROR_TYPES);
}

export function memoryStorageKey(userId: string | null): string {
  const normalizedUserId = userId?.trim();
  // Preserve existing signed-in keys; reserve a distinct key only for the
  // unusual authenticated UID literally equal to "guest".
  const scope = !normalizedUserId
    ? "guest"
    : normalizedUserId === "guest"
      ? "%75ser%3Aguest"
      : encodeURIComponent(normalizedUserId);
  return `${STORAGE_PREFIX}:v${MEMORY_SCHEMA_VERSION}:${scope}`;
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
    const serialized = JSON.stringify(state);
    // Keep writes within the same limit enforced by parseMemoryState.
    // Otherwise an oversized state could be written successfully and then
    // discarded as invalid on the next page load.
    if (serialized.length > MAX_STORAGE_CHARS) return false;
    localStorage.setItem(memoryStorageKey(userId), serialized);
    return true;
  } catch {
    return false;
  }
}
