"use client";

import { useCallback, useState } from "react";

export type ClipboardStatus = "idle" | "success" | "error";

export type UseClipboardReturn = {
  status: ClipboardStatus;
  copy: (text: string) => Promise<boolean>;
  /** Error message if the last copy attempt failed, else null. */
  error: string | null;
};

/**
 * Wraps `navigator.clipboard.writeText` with a permission-denied fallback:
 * when the modern API is unavailable or rejects, we create a hidden textarea,
 * select, and `document.execCommand('copy')`.
 */
export function useClipboard(): UseClipboardReturn {
  const [status, setStatus] = useState<ClipboardStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    setError(null);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus("success");
        return true;
      } catch (err) {
        // Fall through to legacy fallback below.
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    if (typeof document === "undefined") {
      setStatus("error");
      return false;
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand?.("copy") ?? false;
      ta.remove();
      if (ok) {
        setStatus("success");
        return true;
      }
      setStatus("error");
      if (!error) setError("Copy command rejected.");
      return false;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, [error]);

  return { status, copy, error };
}
