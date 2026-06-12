import { test, expect } from "@playwright/test";

test("platform admin can sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/auth/admin-login");

  await page.getByTestId("admin-login-username").fill("platformadmin");
  await page.getByTestId("admin-login-password").fill("Snap@Admin2026");
  await page.getByTestId("admin-login-submit").click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test("invalid credentials show an error", async ({ page }) => {
  await page.goto("/auth/admin-login");

  await page.getByTestId("admin-login-username").fill("platformadmin");
  await page.getByTestId("admin-login-password").fill("wrong-password");
  await page.getByTestId("admin-login-submit").click();

  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/admin-login/);
});
