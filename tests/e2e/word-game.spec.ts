import { expect, test } from "@playwright/test";

test("the vocabulary mini-game gives feedback after an answer", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("alifly-starting-level:guest", "1");
    localStorage.setItem("alifly-learning-level:guest", "1");
    localStorage.setItem("alifly-daily-goal:guest", "1");
  });

  await page.goto("./");
  await page.getByRole("button", { name: "Закрыть" }).click();
  await page.getByRole("button", { name: "Мини-игра: слова" }).click();

  await expect(page.getByRole("heading", { name: "Слово за словом" })).toBeVisible();
  await page.locator(".word-game-option").first().click();
  await expect(page.locator(".word-game-feedback")).toBeVisible();

  await expect.poll(async () => page.evaluate(() => {
    const raw = localStorage.getItem("alifly-memory:v1:guest");
    return raw ? JSON.parse(raw).items.length : 0;
  })).toBe(1);
});
