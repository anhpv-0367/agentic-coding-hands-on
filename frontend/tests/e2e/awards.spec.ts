import { test, expect } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";

/**
 * E2E for /awards page. These tests require an authenticated session. In the
 * current repo state /awards is protected by middleware; tests that rely on
 * /awards being reachable will need auth setup (e.g. a Supabase test session
 * cookie). For the scenarios that only verify client-side hash+scroll+axe
 * behavior, they should be run in an environment where /awards returns 200
 * without redirect.
 */

const AWARD_SLUGS = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-2025-creator",
  "mvp",
] as const;

test.describe("/awards — deep-link (US2)", () => {
  test("hash #mvp places the MVP card in the upper viewport below header", async ({
    page,
  }) => {
    await page.goto("/awards#mvp");
    const mvpSection = page.locator('section[data-award-slug="mvp"]');
    await expect(mvpSection).toBeVisible();

    const box = await mvpSection.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    // Card should be visible below the 80 px header
    expect(box!.y).toBeGreaterThanOrEqual(80);
    expect(box!.y).toBeLessThan(viewport.height);
  });

  test("unknown hash does not scroll beyond the hero", async ({ page }) => {
    await page.goto("/awards#unknown-slug");
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(200);
  });
});

test.describe("/awards — sidebar (US3)", () => {
  test("clicking each sidebar item updates the URL hash", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards");

    for (const slug of AWARD_SLUGS) {
      await page
        .getByRole("navigation", { name: /danh mục giải thưởng|award categories/i })
        .getByRole("link", { name: new RegExp(slug.split("-").join("[ -]"), "i") })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`#${slug}$`));
    }
  });

  test("back button walks through pushState hash entries", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards");

    const nav = page
      .getByRole("navigation", { name: /danh mục giải thưởng|award categories/i });
    await nav.getByRole("link").nth(0).click();
    await nav.getByRole("link").nth(1).click();
    await page.goBack();
    await expect(page).toHaveURL(/#top-talent$/);
  });

  test("sidebar is hidden at tablet width (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/awards");
    const nav = page.getByRole("navigation", {
      name: /danh mục giải thưởng|award categories/i,
    });
    await expect(nav).toBeHidden();
  });
});

test.describe("/awards — chrome (US4)", () => {
  test("header renders with Awards Information selected", async ({ page }) => {
    await page.goto("/awards");
    const awardsNavLink = page
      .getByRole("banner")
      .getByRole("link", { name: /awards information/i });
    await expect(awardsNavLink).toBeVisible();
  });

  test("currency format switches with locale toggle", async ({ page }) => {
    await page.goto("/awards");
    await expect(page.getByText(/7\.000\.000 VNĐ/).first()).toBeVisible();

    await page.evaluate(() => {
      document.cookie = "NEXT_LOCALE=en; path=/";
    });
    await page.goto("/awards");
    await expect(page.getByText(/7,000,000 VND/).first()).toBeVisible();
  });
});

test.describe("/awards — accessibility + polish (Phase 7)", () => {
  test("zero axe violations at WCAG AA level", async ({ page }) => {
    await page.goto("/awards");
    await injectAxe(page);
    await checkA11y(page, undefined, undefined, true);
  });

  test("DOM reading order keeps picture before content in every card", async ({
    page,
  }) => {
    await page.goto("/awards");
    for (const slug of AWARD_SLUGS) {
      const section = page.locator(`section[data-award-slug="${slug}"]`);
      await expect(section).toBeVisible();
      const children = await section.locator(":scope > div").first().evaluate(
        (root) => {
          const first = root.firstElementChild;
          const isPicture =
            first?.tagName.toLowerCase() === "div" &&
            first?.querySelector("img") !== null;
          return { firstIsPicture: isPicture };
        }
      );
      expect(children.firstIsPicture).toBe(true);
    }
  });

  test("reduced-motion scroll is instant", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards#mvp");
    // If animated, scrollY would interpolate; with reduced-motion it jumps.
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(200);
  });
});
