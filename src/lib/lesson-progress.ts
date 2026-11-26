const legacyAlphabetProgress: Record<number, number[]> = {
  1: [20],
  2: [21, 22],
  3: [23],
  4: [24, 25],
  5: [26, 27, 28],
};

function normalizeLessonIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((id): id is number => Number.isInteger(id));
  const alreadyMigrated = ids.some(
    (id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 39),
  );
  const isCurrentLessonId = (id: number) =>
    (id >= 20 && id <= 28) ||
    (id >= 30 && id <= 39) ||
    (id >= 6 && id <= 13);

  const normalized = alreadyMigrated
    ? ids.filter(isCurrentLessonId)
    : ids.flatMap((id) => legacyAlphabetProgress[id] ?? ((id >= 6 && id <= 13) ? [id] : []));
  return [...new Set(normalized)];
}

export function normalizeCompletedLessonIds(value: unknown): number[] {
  return normalizeLessonIds(value);
}

export function normalizeDailyLessonIds(value: unknown): number[] {
  return normalizeLessonIds(value);
}
