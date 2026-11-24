import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Firestore emulator tests use Node's built-in test runner and run in their own workflow.
    include: ["src/**/*.test.ts"],
  },
});
