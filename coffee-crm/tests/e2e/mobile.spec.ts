import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("phone layout uses a slide-out menu", async ({ page }) => {
  await loginAs(page, "staff@coffee.test");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Customers" }).click();
  await expect(page).toHaveURL(/\/customers$/);
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
});
