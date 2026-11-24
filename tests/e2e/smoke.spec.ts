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
