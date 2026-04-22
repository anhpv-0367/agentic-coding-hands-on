"use client";

import { useEffect, useRef, useState } from "react";

export type PollingState<T> = {
  data: T | null;
  /** Number of consecutive poll errors (resets to 0 on success). */
  errorCount: number;
  /** `true` if the 3rd consecutive failure has paused polling. */
  paused: boolean;
  lastError: Error | null;
};

type Options<T> = {
  intervalMs: number;
  initialData?: T | null;
  /** Abort the fetcher when the component unmounts. */
  enabled?: boolean;
  /** Pause polling while document is hidden (default: true). */
  pauseWhenHidden?: boolean;
  /** After this many consecutive failures, pause polling until user resumes. */
  maxFailures?: number;
};

/**
 * Generic polling hook.
 * - Fires `fetcher` every `intervalMs` while `enabled` is true.
 * - Pauses while `document.visibilityState === "hidden"` (toggle via `pauseWhenHidden`).
 * - After `maxFailures` consecutive errors, enters `paused: true` — user must call
 *   `resume()` to retry.
 */
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: Options<T>
): PollingState<T> & { resume: () => void } {
  const {
    intervalMs,
    initialData = null,
    enabled = true,
    pauseWhenHidden = true,
    maxFailures = 3,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [errorCount, setErrorCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled || paused) return;

    let cancelled = false;
    let timer: number | null = null;
    let controller: AbortController | null = null;

    async function runOne() {
      controller = new AbortController();
      try {
        const result = await fetcherRef.current(controller.signal);
        if (cancelled) return;
        setData(result);
        setErrorCount(0);
        setLastError(null);
      } catch (err) {
        if (cancelled) return;
        const errorObj = err instanceof Error ? err : new Error(String(err));
        if (errorObj.name === "AbortError") return;
        setLastError(errorObj);
        setErrorCount((n) => {
          const next = n + 1;
          if (next >= maxFailures) setPaused(true);
          return next;
        });
      }
    }

    function schedule() {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        void runOne().then(schedule);
      }, intervalMs);
    }

    function onVisibility() {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === "hidden") {
        if (timer !== null) window.clearTimeout(timer);
        controller?.abort();
      } else {
        schedule();
      }
    }

    void runOne().then(schedule);
    if (pauseWhenHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      controller?.abort();
      if (pauseWhenHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [intervalMs, enabled, paused, pauseWhenHidden, maxFailures]);

  function resume() {
    setPaused(false);
    setErrorCount(0);
  }

  return { data, errorCount, paused, lastError, resume };
}
