import {
  EMPTY_MEMORY_STATE,
  MEMORY_SCHEMA_VERSION,
  type MemoryGrade,
  type MemoryItem,
  type MemoryReviewEvent,
  type MemoryState,
  type ReviewInput,
  type ReviewResult,
} from "./types";

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3;
const SUCCESS_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
const RETRY_DELAY_MS = 10 * 60 * 1000;
const MAX_RECENT_EVENTS = 500;

function clampEaseFactor(value: number): number {
  return Math.min(MAX_EASE_FACTOR, Math.max(MIN_EASE_FACTOR, value));
}

function nextSuccessfulInterval(repetitions: number): number {
  return SUCCESS_INTERVALS_DAYS[
    Math.min(Math.max(0, repetitions), SUCCESS_INTERVALS_DAYS.length - 1)
  ];
}

/** Create a stable, content-addressed item without copying lesson text or answers. */
export function createMemoryItem(input: {
  id: string;
  contentType: MemoryItem["contentType"];
  contentId: string;
  skill: MemoryItem["skill"];
  now?: number;
}): MemoryItem {
  const now = input.now ?? Date.now();

  return {
    schemaVersion: MEMORY_SCHEMA_VERSION,
    id: input.id,
    contentType: input.contentType,
    contentId: input.contentId,
    skill: input.skill,
    dueAt: now,
    intervalDays: 0,
    repetitions: 0,
    easeFactor: 2.5,
    lapseCount: 0,
    lastReviewedAt: null,
    lastGrade: null,
    lastErrorType: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Apply a learner's self-assessment. The schedule is an explainable heuristic,
 * not a prediction of an individual's exact forgetting curve.
 */
export function reviewMemoryItem(
  previous: MemoryItem,
  input: ReviewInput,
  eventId: string,
): ReviewResult {
  const reviewedAt = input.reviewedAt ?? Date.now();
  const nextRepetition = previous.repetitions + 1;
  const baseInterval = nextSuccessfulInterval(previous.repetitions);

  let intervalDays = previous.intervalDays;
  let repetitions = previous.repetitions;
  let easeFactor = previous.easeFactor;
  let lapseCount = previous.lapseCount;

  if (input.grade === "again") {
    intervalDays = 0;
    repetitions = 0;
    easeFactor = clampEaseFactor(easeFactor - 0.2);
    lapseCount += 1;
  } else if (input.grade === "hard") {
    intervalDays = Math.max(1, Math.ceil((previous.intervalDays || baseInterval) * 1.2));
    repetitions = nextRepetition;
    easeFactor = clampEaseFactor(easeFactor - 0.15);
  } else if (input.grade === "good") {
    intervalDays = baseInterval;
    repetitions = nextRepetition;
  } else {
    intervalDays = Math.max(baseInterval + 1, Math.ceil(baseInterval * 1.5));
    repetitions = nextRepetition;
    easeFactor = clampEaseFactor(easeFactor + 0.1);
  }

  const item: MemoryItem = {
    ...previous,
    dueAt: reviewedAt + (input.grade === "again" ? RETRY_DELAY_MS : intervalDays * 24 * 60 * 60 * 1000),
    intervalDays,
    repetitions,
    easeFactor,
    lapseCount,
    lastReviewedAt: reviewedAt,
    lastGrade: input.grade,
    lastErrorType: input.grade === "again" ? input.errorType ?? "unknown" : null,
    updatedAt: reviewedAt,
  };

  const event: MemoryReviewEvent = {
    id: eventId,
    itemId: previous.id,
    reviewedAt,
    grade: input.grade,
    responseTimeMs: input.responseTimeMs ?? null,
    usedHint: input.usedHint ?? false,
    errorType: input.grade === "again" ? input.errorType ?? "unknown" : null,
  };

  return { item, event };
}

export function getDueMemoryItems(
  state: MemoryState,
  now = Date.now(),
  limit = 20,
): MemoryItem[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 20;

  return state.items
    .filter((item) => item.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt || b.lapseCount - a.lapseCount)
    .slice(0, safeLimit);
}

export function appendReviewResult(
  state: MemoryState,
  result: ReviewResult,
): MemoryState {
  const items = state.items.filter((item) => item.id !== result.item.id);
  const recentEvents = [...state.recentEvents, result.event].slice(-MAX_RECENT_EVENTS);

  return {
    schemaVersion: MEMORY_SCHEMA_VERSION,
    updatedAt: result.event.reviewedAt,
    items: [...items, result.item],
    recentEvents,
  };
}

export function createEmptyMemoryState(now = Date.now()): MemoryState {
  return { ...EMPTY_MEMORY_STATE, updatedAt: now, items: [], recentEvents: [] };
}

export function isMemoryGrade(value: unknown): value is MemoryGrade {
  return value === "again" || value === "hard" || value === "good" || value === "easy";
}
