import { renderHook, act } from "@testing-library/react";
import type { AwardSlug } from "@/types/awards";
import { useScrollSpy } from "@/components/awards/useScrollSpy";

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  targets: Set<Element>;
  disconnect: jest.Mock;
};

const observerInstances: ObserverInstance[] = [];

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  instance: ObserverInstance;

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    this.rootMargin = options?.rootMargin ?? "";
    this.instance = {
      callback,
      options,
      targets: new Set(),
      disconnect: jest.fn(),
    };
    observerInstances.push(this.instance);
  }

  observe(target: Element): void {
    this.instance.targets.add(target);
  }

  unobserve(target: Element): void {
    this.instance.targets.delete(target);
  }

  disconnect(): void {
    this.instance.disconnect();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function mockSection(slug: AwardSlug) {
  const section = document.createElement("section");
  section.setAttribute("data-award-slug", slug);
  document.body.appendChild(section);
  return section;
}

describe("useScrollSpy", () => {
  const SLUGS: ReadonlyArray<AwardSlug> = [
    "top-talent",
    "top-project",
    "top-project-leader",
    "best-manager",
    "signature-2025-creator",
    "mvp",
  ];

  beforeEach(() => {
    document.body.innerHTML = "";
    observerInstances.length = 0;
    (globalThis as unknown as {
      IntersectionObserver: typeof IntersectionObserver;
    }).IntersectionObserver =
      ControlledIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it("initializes with the first slug as active", () => {
    SLUGS.forEach(mockSection);
    const { result } = renderHook(() => useScrollSpy(SLUGS));
    expect(result.current).toBe("top-talent");
  });

  it("uses rootMargin -80px 0px -50% 0px on the observer", () => {
    SLUGS.forEach(mockSection);
    renderHook(() => useScrollSpy(SLUGS));
    expect(observerInstances).toHaveLength(1);
    expect(observerInstances[0].options?.rootMargin).toBe(
      "-80px 0px -50% 0px"
    );
  });

  it("updates activeSlug when an entry starts intersecting", () => {
    const sections = SLUGS.map(mockSection);
    const { result } = renderHook(() => useScrollSpy(SLUGS));
    const observer = observerInstances[0];

    const entries: IntersectionObserverEntry[] = [
      {
        target: sections[2],
        isIntersecting: true,
        intersectionRatio: 0.6,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: 0,
      },
    ];

    act(() => {
      observer.callback(entries, observer as unknown as IntersectionObserver);
    });

    expect(result.current).toBe("top-project-leader");
  });

  it("disconnects the observer on unmount", () => {
    SLUGS.forEach(mockSection);
    const { unmount } = renderHook(() => useScrollSpy(SLUGS));
    const observer = observerInstances[0];
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
