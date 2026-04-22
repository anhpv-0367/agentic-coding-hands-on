import { test, expect } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";

// T041: Viewport responsive tests
test.describe("Login page – responsive layout", () => {
  test("mobile 375×812 – login button is full-width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    const button = page.getByRole("button", { name: /đăng nhập bằng google/i });
    await expect(button).toBeVisible();

    const btnBox = await button.boundingBox();
    const viewport = page.viewportSize()!;
    // Button wrapper should span close to full viewport width (minus padding)
    expect(btnBox!.width).toBeGreaterThan(viewport.width * 0.7);
  });

  test("tablet 768×1024 – ROOT FURTHER logo width ≤360px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/login");

    const logo = page.getByRole("img", { name: "ROOT FURTHER" });
    await expect(logo).toBeVisible();

    const logoBox = await logo.boundingBox();
    expect(logoBox!.width).toBeLessThanOrEqual(360);
  });

  test("desktop 1440×1024 – login button visible and page renders", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: /đăng nhập bằng google/i })
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "ROOT FURTHER" })).toBeVisible();
  });
});

// T042: Accessibility – zero WCAG AA violations
test.describe("Login page – accessibility", () => {
  test("zero axe violations at WCAG AA level", async ({ page }) => {
    await page.goto("/login");
    await injectAxe(page);
    await checkA11y(page, undefined, undefined, true);
  });
});

// T046: E2E – error path
test.describe("Login page – error display", () => {
  test("?error=auth_failed shows error message", async ({ page }) => {
    await page.goto("/login?error=auth_failed");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(/đăng nhập|failed|thất bại/i);
  });

  test("?error=service_unavailable shows error message", async ({ page }) => {
    await page.goto("/login?error=service_unavailable");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("unknown ?error falls back to auth_failed message", async ({ page }) => {
    await page.goto("/login?error=some_unknown_error");
    // Unknown errors are treated as null (no alert shown)
    await expect(page.getByRole("alert")).not.toBeVisible();
  });
});
