import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("visitors are sent to the login page", async ({ page }) => {
  await page.goto("/products");
  await expect(page).toHaveURL(/\/login\?next=%2Fproducts$/);
});

test("wrong password shows a generic error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@coffee.test");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /incorrect/ })).toHaveText("Email or password is incorrect.");
});

test("after login, user returns to the page they asked for", async ({ page }) => {
  await page.goto("/sales");
  await page.getByLabel("Email").fill("staff@coffee.test");
  await page.getByLabel("Password").fill("Coffee#2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/sales$/);
});

test("owner sees every menu item", async ({ page }) => {
  await loginAs(page, "owner@coffee.test");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const label of ["Dashboard", "Sales", "Products", "Suppliers", "Expenses", "Reports", "Activity log", "Settings"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(page.getByTestId("current-user")).toHaveText("Olivia Owner");
});

test("staff menu hides restricted pages and the server blocks direct access", async ({ page }) => {
  await loginAs(page, "staff@coffee.test");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Sales" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Stock audit" })).toBeVisible();
  for (const label of ["Suppliers", "Expenses", "Reports", "Settings", "Activity log"]) {
    await expect(nav.getByRole("link", { name: label })).toHaveCount(0);
  }
  // Typing the address directly is blocked too.
  for (const path of ["/reports", "/settings", "/expenses", "/suppliers", "/activity"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/no-access$/);
  }
});

test("manager can open reports but not see the owner's activity", async ({ page }) => {
  await loginAs(page, "manager@coffee.test");
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await page.goto("/activity");
  await expect(page.getByRole("heading", { name: "Activity log" })).toBeVisible();
  await expect(page.getByText("Olivia Owner logged in")).toHaveCount(0);
});

test("owner sees logins in the activity log", async ({ page }) => {
  await loginAs(page, "owner@coffee.test");
  await page.goto("/activity");
  await expect(page.getByText("Olivia Owner logged in").first()).toBeVisible();
  await expect(page.getByText("Failed login for staff@coffee.test").first()).toBeVisible();
});

test("logout ends the session", async ({ page }) => {
  await loginAs(page, "manager@coffee.test");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("repeated wrong passwords lock the email out for 15 minutes", async ({ page }) => {
  await page.goto("/login");
  const error = page.getByRole("alert").filter({ hasText: /incorrect|Too many/ });
  // Submit the form and wait for the server to answer before continuing.
  const attempt = async (password: string) => {
    await page.getByLabel("Email").fill("downtown@coffee.test");
    await page.getByLabel("Password").fill(password);
    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST"),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);
  };
  for (let i = 0; i < 5; i++) {
    await attempt(`guess-${i}`);
    await expect(error).toHaveText("Email or password is incorrect.");
  }
  // Even the correct password is refused now.
  await attempt("Coffee#2026");
  await expect(error).toHaveText(/Too many failed attempts/);
  await expect(page).toHaveURL(/\/login/);
});
