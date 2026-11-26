import { expect, test } from "@playwright/test";

test("a learner can skip the alphabet and start with simple words", async ({ page }) => {
  await page.goto("./");

  await expect(page.locator(".auth-backdrop")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "С какого уровня начнём?" })).toBeVisible();
  await page.getByRole("button", { name: /Читаю простые слова/ }).click();

  await expect(page.getByRole("heading", { name: "Книга и ручка" })).toBeVisible();
  await expect(page.locator(".study-phrase-arabic").first()).toHaveText("كِتَاب");
});

test("level 3 keeps sentence lessons in sequence and preserves their progress", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("alifly-starting-level:guest", "3");
    localStorage.setItem("alifly-daily-goal:guest", "1");
    localStorage.setItem("alifly-completed-lessons", JSON.stringify([35, 36, 37, 38]));
  });
  await page.goto("./");

  await page.getByRole("button", { name: /Слова и первые предложения/ }).click();
  await expect(page.getByRole("button", { name: /Что это\? — вопрос и ответ/ })).toHaveText(/Пройден/);
  await expect(page.getByRole("button", { name: /Вопросы с ответом «да» и «нет»/ })).toBeEnabled();
});

test("the diagnostic recommends a level and opens the matching route", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("button", { name: "Не знаю свой уровень — проверить" }).click();
  await expect(page.getByRole("heading", { name: "Короткая диагностика" })).toBeVisible();

  await page.getByRole("button", { name: "ب" }).click();
  await page.getByRole("button", { name: "Продолжить →" }).click();

  await page.getByRole("button", { name: "ба" }).click();
  await page.getByRole("button", { name: "Продолжить →" }).click();

  await page.getByRole("button", { name: "китаб" }).click();
  await page.getByRole("button", { name: "Продолжить →" }).click();

  await page.getByRole("button", { name: "Как тебя зовут?" }).click();
  await page.getByRole("button", { name: "Продолжить →" }).click();

  await expect(page.getByRole("heading", { name: "Подходящий старт найден" })).toBeVisible();
  await page.getByRole("button", { name: "Начать обучение →" }).click();
  await expect(page.getByRole("heading", { name: "Приветствие и ответ" })).toBeVisible();
});
