import { renderHook } from "@testing-library/react";
import { useHashScroll } from "@/components/awards/useHashScroll";

type MatchMediaFn = (query: string) => MediaQueryList;

function mockSection(slug: string) {
  const section = document.createElement("section");
  section.id = slug;
  section.setAttribute("data-award-slug", slug);
  document.body.appendChild(section);
  section.getBoundingClientRect = jest.fn(
    () =>
      ({
        top: 500,
        left: 0,
        bottom: 1000,
        right: 1000,
        width: 1000,
        height: 500,
        x: 0,
        y: 500,
        toJSON: () => ({}),
      }) as DOMRect
  );
  return section;
}

function setPrefersReducedMotion(reduced: boolean) {
  const mq: MatchMediaFn = (query) =>
    ({
      matches: reduced && query.includes("reduce"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mq,
  });
}

describe("useHashScroll", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.scrollTo = jest.fn();
    window.history.replaceState(null, "", "/awards");
    setPrefersReducedMotion(false);
  });

  it("scrolls to the target matching location.hash on mount", async () => {
    mockSection("top-talent");
    window.history.replaceState(null, "", "/awards#top-talent");

    renderHook(() => useHashScroll());

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "smooth",
        top: expect.any(Number),
      })
    );
  });

  it("does not scroll when the hash does not match any known section", async () => {
    mockSection("top-talent");
    window.history.replaceState(null, "", "/awards#unknown-slug");

    renderHook(() => useHashScroll());

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("uses instant scroll when prefers-reduced-motion is reduce", async () => {
    mockSection("mvp");
    setPrefersReducedMotion(true);
    window.history.replaceState(null, "", "/awards#mvp");

    renderHook(() => useHashScroll());

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "auto",
      })
    );
  });

  it("responds to hashchange events after mount", () => {
    mockSection("best-manager");

    renderHook(() => useHashScroll());

    window.history.replaceState(null, "", "/awards#best-manager");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(window.scrollTo).toHaveBeenCalled();
  });
});
