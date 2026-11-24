import type { MemorySkill } from "./types";

/**
 * Build a stable, opaque identity for a question already used by ALIFLY's
 * legacy review queue. The source ID is hashed so prompt text is never copied
 * into the memory record or its localStorage key.
 */
export function createLessonMemoryIdentity(
  lessonId: number,
  legacyQuestionId: string,
  isRecallQuestion: boolean,
): { id: string; contentId: string; skill: MemorySkill } {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;

  for (let index = 0; index < legacyQuestionId.length; index += 1) {
    const code = legacyQuestionId.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0;
  }

  const opaqueId = `${first.toString(36)}${second.toString(36)}`;
  const contentId = `lesson-${lessonId}-question-${opaqueId}`;

  return {
    id: contentId,
    contentId,
    skill: isRecallQuestion ? "recall" : "recognition",
  };
}
