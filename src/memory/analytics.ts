import type { MemorySkill, MemoryState } from "./types";
import { getDueMemoryItems } from "./engine";

export type MemoryInsights = {
  totalItems: number;
  dueItems: number;
  weakItems: number;
  reviewedItems: number;
  accuracyPercent: number;
  skillCounts: Array<{ skill: MemorySkill; count: number; accuracyPercent: number }>;
};

const SKILL_LABELS: Record<MemorySkill, string> = {
  recognition: "Узнавание",
  recall: "Воспроизведение",
  pronunciation: "Произношение",
  listening: "Аудирование",
  reading: "Чтение",
  meaning: "Значение",
  grammar: "Грамматика",
};

export function getMemoryInsights(state: MemoryState, now = Date.now()): MemoryInsights {
  const dueItems = getDueMemoryItems(state, now, Number.MAX_SAFE_INTEGER);
  const reviewedItems = state.items.filter((item) => item.lastReviewedAt !== null);
  const successful = state.recentEvents.filter((event) => event.grade !== "again").length;
  const failed = state.recentEvents.filter((event) => event.grade === "again").length;
  const total = successful + failed;

  const skillCounts = (Object.keys(SKILL_LABELS) as MemorySkill[])
    .map((skill) => {
      const items = state.items.filter((item) => item.skill === skill);
      const ids = new Set(items.map((item) => item.id));
      const events = state.recentEvents.filter((event) => ids.has(event.itemId));
      const passed = events.filter((event) => event.grade !== "again").length;
      const attempts = events.length;
      return {
        skill,
        count: items.length,
        attempts,
        accuracyPercent: attempts ? Math.round((passed / attempts) * 100) : 0,
      };
    })
    // Do not label never-reviewed skills as weak with a misleading 0% score.
    .filter((item) => item.count > 0 && item.attempts > 0)
    .map(({ attempts: _attempts, ...item }) => item)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent || b.count - a.count);

  return {
    totalItems: state.items.length,
    dueItems: dueItems.length,
    weakItems: state.items.filter((item) => item.lapseCount > 0).length,
    reviewedItems: reviewedItems.length,
    accuracyPercent: total ? Math.round((successful / total) * 100) : 0,
    skillCounts,
  };
}

export function memorySkillLabel(skill: MemorySkill): string {
  return SKILL_LABELS[skill];
}
