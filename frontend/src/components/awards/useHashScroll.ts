"use client";

import { useEffect } from "react";

const SCROLL_OFFSET_PX = 104;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToSlug(slug: string): void {
  if (typeof document === "undefined") return;
  if (!slug) return;
  const target = document.getElementById(slug);
  if (!target) return;
  if (!target.hasAttribute("data-award-slug")) return;

  const top =
    target.getBoundingClientRect().top +
    (window.scrollY || window.pageYOffset) -
    SCROLL_OFFSET_PX;

  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  window.scrollTo({ top, left: 0, behavior });
}

export function useHashScroll(): void {
  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.location.hash : "";
    const slug = raw.startsWith("#") ? raw.slice(1) : raw;
    if (slug) {
      // Defer one frame so layout has stabilized.
      requestAnimationFrame(() => scrollToSlug(slug));
    }

    function onHashChange() {
      const next = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      scrollToSlug(next);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
}
