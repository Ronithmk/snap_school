import type { Page } from "@playwright/test";

/** Logs in as the platform admin (full access to every school's orders/analytics). */
export async function loginAsPlatformAdmin(page: Page) {
  await page.goto("/auth/admin-login");
  await page.getByTestId("admin-login-username").fill("platformadmin");
  await page.getByTestId("admin-login-password").fill("Snap@Admin2026");
  await page.getByTestId("admin-login-submit").click();
  await page.waitForURL(/\/dashboard/);
}
