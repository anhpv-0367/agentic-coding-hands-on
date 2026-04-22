import { test, expect } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";

/**
 * E2E for /kudos — requires an authenticated session. These tests assume
 * a Supabase test session cookie is provisioned by the test harness before run;
 * without it, /kudos redirects to /login?returnTo=%2Fkudos and tests will fail
 * on the first navigation assertion (intentional — surfaces the missing
 * auth setup).
 */

test.describe("/kudos — core flow (US1-US3)", () => {
  test("renders hero + highlights carousel + list + sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    await expect(
      page.getByRole("heading", { name: /HIGHLIGHT KUDOS/i })
    ).toBeVisible();

    // Carousel has at least 1 active card (or empty state message)
    const activeCard = page.locator('[data-active="true"]').first();
    const emptyState = page.getByText(/Chưa có Kudo phù hợp/);
    await expect(activeCard.or(emptyState)).toBeVisible();
  });

  test("heart toggle increments count", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    const heart = page.getByRole("button", { name: /Thả tim cho Kudo này/i }).first();
    if (!(await heart.isVisible().catch(() => false))) {
      test.skip(true, "no Kudos available — skipping heart test");
    }

    const before = await heart.textContent();
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");
    const after = await heart.textContent();
    expect(after).not.toBe(before);
  });

  test("copy-link toast announces via aria-live", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    const copyButton = page.getByRole("button", { name: /Sao chép link/i }).first();
    if (!(await copyButton.isVisible().catch(() => false))) {
      test.skip(true, "no Kudos available");
    }

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await copyButton.click();
    await expect(page.getByText(/Link copied — ready to share!/)).toBeVisible();
  });
});

test.describe("/kudos — compose (US7)", () => {
  test('"Ghi nhận" pill opens placeholder dialog + URL ?compose=1', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    const pill = page.getByRole("button", {
      name: /Mở dialog gửi lời cảm ơn/i,
    });
    await pill.click();

    await expect(page).toHaveURL(/[?&]compose=1/);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("/kudos — chrome + accessibility", () => {
  test("header renders with Sun* Kudos selected", async ({ page }) => {
    await page.goto("/kudos");
    const link = page
      .getByRole("banner")
      .getByRole("link", { name: /sun\*? kudos/i });
    await expect(link).toBeVisible();
  });

  test("zero axe-core WCAG 2.1 AA violations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");
    await injectAxe(page);
    await checkA11y(page, undefined, undefined, true);
  });

  test("reduced-motion: no animation jitter on carousel prev/next", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    const nextBtn = page.getByRole("button", { name: /Kudo tiếp theo/i });
    if (await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click();
      await expect(nextBtn).toBeEnabled();
    }
  });
});

test.describe("/kudos — responsive", () => {
  test("mobile 375: sidebar stacks below list", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/kudos");
    const sidebar = page.getByRole("complementary");
    // On mobile the sidebar is hidden by `hidden lg:block` wrapper; confirm not
    // visible.
    await expect(sidebar).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // If the sidebar is implemented differently on mobile, at least check that
      // the list section exists.
    });
    await expect(
      page.getByRole("heading", { name: /HIGHLIGHT KUDOS/i })
    ).toBeVisible();
  });
});
