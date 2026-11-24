import { expect, test } from "@playwright/test";

test("a learner can skip the alphabet and start with simple words", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "С какого уровня начнём?" })).toBeVisible();
  await page.getByRole("button", { name: /Читаю простые слова/ }).click();

  await expect(page.getByRole("heading", { name: "Книга и ручка" })).toBeVisible();
  await expect(page.getByText("كِتَاب")).toBeVisible();
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
