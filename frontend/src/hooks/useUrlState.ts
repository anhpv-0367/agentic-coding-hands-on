"use client";

import { useCallback, useEffect, useState } from "react";

type ParamValue = string | null;

/**
 * Sync a single URL search param with React state. Uses `history.replaceState`
 * (no history pollution) unless `mode: "push"` is passed, in which case `pushState`
 * is used — appropriate for dialog open-state where Back should close the dialog.
 */
export function useUrlState(
  paramName: string,
  options: { mode?: "replace" | "push" } = {}
): [ParamValue, (next: ParamValue) => void] {
  const { mode = "replace" } = options;

  const [value, setValue] = useState<ParamValue>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(paramName));
  }, [paramName]);

  const setUrlValue = useCallback(
    (next: ParamValue) => {
      setValue(next);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (next === null || next === "") {
        url.searchParams.delete(paramName);
      } else {
        url.searchParams.set(paramName, next);
      }
      const method = mode === "push" ? "pushState" : "replaceState";
      window.history[method](null, "", url);
    },
    [paramName, mode]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(paramName));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [paramName]);

  return [value, setUrlValue];
}
