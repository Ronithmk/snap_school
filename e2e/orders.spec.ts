import { test, expect } from "@playwright/test";
import { loginAsPlatformAdmin } from "./utils";

test("orders list renders and links to order detail", async ({ page }) => {
  await loginAsPlatformAdmin(page);

  await page.goto("/dashboard/orders");
  await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();

  const firstRow = page.getByTestId("order-row").first();
  await expect(firstRow).toBeVisible();

  await firstRow.getByTestId("order-link").click();
  await expect(page).toHaveURL(/\/dashboard\/orders\/[^/]+$/);
  await expect(page.getByTestId("order-status-badge")).toBeVisible();
});

test("cancelling an order updates its status and hides the cancel button", async ({ page }) => {
  await loginAsPlatformAdmin(page);

  await page.goto("/dashboard/orders");
  const firstRow = page.getByTestId("order-row").first();
  await firstRow.getByTestId("order-link").click();
  await expect(page).toHaveURL(/\/dashboard\/orders\/[^/]+$/);
  await expect(page.getByTestId("order-status-badge")).toBeVisible();

  const cancelButton = page.getByTestId("cancel-order-button");
  if (await cancelButton.isVisible()) {
    page.once("dialog", (dialog) => dialog.accept());
    await cancelButton.click();
    await expect(page.getByTestId("order-status-badge")).toHaveText(/cancelled/i);
    await expect(cancelButton).not.toBeVisible();
  } else {
    await expect(page.getByTestId("order-status-badge")).toHaveText(/cancelled|completed|shipped|refunded/i);
  }
});
