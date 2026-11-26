import { expect, test } from "@playwright/test";

test("homepage loads with Russian language and ALIFLY metadata", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("./");
  await expect(page).toHaveTitle(/ALIFLY/i);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("main")).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("homepage exposes a usable main landmark", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("main")).toBeVisible();
});

test("direct first-lesson URL opens the interactive lesson", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("./lessons/alif/");
  await expect(page).toHaveURL("http://127.0.0.1:4173/alifly/lessons/alif/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Алиф, ба, та и са" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("direct sign-in URL opens the sign-in dialog", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("./login");
  await expect(page).toHaveURL("http://127.0.0.1:4173/alifly/login");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "С возвращением" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});


test("first alphabet lesson shows the new articulation diagram and updates it per letter", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("./lessons/alif/");
  await expect(page.getByRole("heading", { name: "Алиф, ба, та и са" })).toBeVisible();
  await expect(page.locator(".pronunciation-visual")).toBeVisible();
  await expect(page.locator(".pronunciation-visual__svg")).toHaveAttribute("aria-label", /Схема речевого аппарата/);
  await expect(page.locator(".pronunciation-visual__caption strong")).toHaveText("Полость рта и горла");

  await page.getByRole("button", { name: "Следующая →" }).click();
  await expect(page.locator(".letter-flashcard-character")).toHaveText("ب");
  await expect(page.locator(".pronunciation-visual__caption strong")).toHaveText("Две сомкнутые губы");

  expect(pageErrors).toEqual([]);
});
