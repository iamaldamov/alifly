import { describe, expect, it } from "vitest";
import { createLessonMemoryIdentity } from "./lessonAdapter";

describe("lesson memory identity", () => {
  it("creates deterministic opaque IDs for the same lesson question", () => {
    const first = createLessonMemoryIdentity(2, "2:question prompt", false);
    const second = createLessonMemoryIdentity(2, "2:question prompt", false);

    expect(first).toEqual(second);
    expect(first.id).not.toContain("question prompt");
    expect(first.skill).toBe("recognition");
  });

  it("separates lessons and recall from recognition", () => {
    const lessonA = createLessonMemoryIdentity(1, "same-question", false);
    const lessonB = createLessonMemoryIdentity(2, "same-question", false);
    const recall = createLessonMemoryIdentity(1, "same-question", true);

    expect(lessonA.id).not.toBe(lessonB.id);
    expect(recall.id).toBe(lessonA.id);
    expect(recall.skill).toBe("recall");
  });
});
