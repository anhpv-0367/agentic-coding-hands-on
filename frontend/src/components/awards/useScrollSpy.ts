"use client";

import { useEffect, useState } from "react";
import type { AwardSlug } from "@/types/awards";

const ROOT_MARGIN = "-80px 0px -50% 0px";

export function useScrollSpy(
  slugs: ReadonlyArray<AwardSlug>
): AwardSlug | null {
  const [activeSlug, setActiveSlug] = useState<AwardSlug | null>(
    slugs[0] ?? null
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const slugSet = new Set<string>(slugs);
    const elements: HTMLElement[] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-award-slug]")
    ).filter((el) => {
      const slug = el.getAttribute("data-award-slug");
      return slug !== null && slugSet.has(slug);
    });

    if (elements.length === 0) return;

    const visibleSlugs = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.getAttribute("data-award-slug");
          if (!slug) continue;
          if (entry.isIntersecting) {
            visibleSlugs.add(slug);
          } else {
            visibleSlugs.delete(slug);
          }
        }

        for (const slug of slugs) {
          if (visibleSlugs.has(slug)) {
            setActiveSlug(slug);
            return;
          }
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [slugs]);

  return activeSlug;
}
