/**
 * ALIFLY MEMORY ENGINE — versioned domain types.
 *
 * This module is intentionally additive. Existing Mistake records and lesson
 * progress remain owned by App.tsx until an explicit migration is reviewed.
 */

export const MEMORY_SCHEMA_VERSION = 1 as const;

export type MemorySkill =
  | "recognition"
  | "recall"
  | "pronunciation"
  | "listening"
  | "reading"
  | "meaning"
  | "grammar";

export type MemoryContentType =
  | "letter"
  | "vowel_mark"
  | "syllable"
  | "word"
  | "phrase"
  | "grammar_rule"
  | "lesson_question";

export type MemoryGrade = "again" | "hard" | "good" | "easy";

export type MemoryErrorType =
  | "shape"
  | "dots"
  | "letter_name"
  | "pronunciation"
  | "listening"
  | "meaning"
  | "reading"
  | "grammar"
  | "attention"
  | "unknown";

export type MemoryItem = {
  schemaVersion: typeof MEMORY_SCHEMA_VERSION;
  id: string;
  contentType: MemoryContentType;
  contentId: string;
  skill: MemorySkill;
  dueAt: number;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  lapseCount: number;
  lastReviewedAt: number | null;
  lastGrade: MemoryGrade | null;
  lastErrorType: MemoryErrorType | null;
  createdAt: number;
  updatedAt: number;
};

export type MemoryReviewEvent = {
  id: string;
  itemId: string;
  reviewedAt: number;
  grade: MemoryGrade;
  responseTimeMs: number | null;
  usedHint: boolean;
  errorType: MemoryErrorType | null;
};

export type MemoryState = {
  schemaVersion: typeof MEMORY_SCHEMA_VERSION;
  updatedAt: number;
  items: MemoryItem[];
  recentEvents: MemoryReviewEvent[];
};

export type ReviewInput = {
  grade: MemoryGrade;
  reviewedAt?: number;
  responseTimeMs?: number | null;
  usedHint?: boolean;
  errorType?: MemoryErrorType | null;
};

export type ReviewResult = {
  item: MemoryItem;
  event: MemoryReviewEvent;
};

export const EMPTY_MEMORY_STATE: MemoryState = {
  schemaVersion: MEMORY_SCHEMA_VERSION,
  updatedAt: 0,
  items: [],
  recentEvents: [],
};
