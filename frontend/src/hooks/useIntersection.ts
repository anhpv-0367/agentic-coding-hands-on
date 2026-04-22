"use client";

import { useEffect, type RefObject } from "react";

/**
 * Fires `onIntersect` every time `ref.current` enters the viewport.
 * Used for load-more triggers on paginated lists.
 */
export function useIntersection(
  ref: RefObject<Element | null>,
  onIntersect: () => void,
  options: IntersectionObserverInit = { rootMargin: "200px" }
): void {
  useEffect(() => {
    const target = ref.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onIntersect();
      }
    }, options);
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref, onIntersect, options]);
}
