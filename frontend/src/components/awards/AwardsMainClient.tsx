"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import type { AwardSlug } from "@/types/awards";
import AwardsSidebar from "./AwardsSidebar";
import { useHashScroll } from "./useHashScroll";
import { useScrollSpy } from "./useScrollSpy";

type SidebarItem = {
  slug: AwardSlug;
  label: string;
};

type Props = {
  children: ReactNode;
  sidebarItems: ReadonlyArray<SidebarItem>;
  sidebarAriaLabel: string;
};

const SCROLL_OFFSET_PX = 104;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToSlug(slug: AwardSlug): void {
  const target = document.getElementById(slug);
  if (!target) return;
  const top =
    target.getBoundingClientRect().top +
    (window.scrollY || window.pageYOffset) -
    SCROLL_OFFSET_PX;
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  window.scrollTo({ top, left: 0, behavior });
}

export default function AwardsMainClient({
  children,
  sidebarItems,
  sidebarAriaLabel,
}: Props) {
  useHashScroll();

  const slugs = useMemo(
    () => sidebarItems.map((item) => item.slug),
    [sidebarItems]
  );
  const activeSlug = useScrollSpy(slugs);

  const onNavigate = useCallback((slug: AwardSlug) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${slug}`);
    }
    scrollToSlug(slug);
  }, []);

  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{
        width: "100%",
        maxWidth: "1152px",
        alignSelf: "center",
        alignItems: "flex-start",
        gap: "var(--space-awards-2col-gap, 80px)",
      }}
    >
      <AwardsSidebar
        items={sidebarItems}
        activeSlug={activeSlug}
        ariaLabel={sidebarAriaLabel}
        onNavigate={onNavigate}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-awards-cards-gap, 80px)",
          flex: 1,
          minWidth: 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
