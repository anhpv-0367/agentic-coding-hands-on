"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "info" | "success" | "error";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastAPI = {
  toasts: ReadonlyArray<Toast>;
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>.");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
  defaultDurationMs?: number;
};

export default function ToastProvider({
  children,
  defaultDurationMs = 2500,
}: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info",
      durationMs: number = defaultDurationMs
    ) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, message, variant, durationMs }]);
      return id;
    },
    [defaultDurationMs]
  );

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismiss(t.id), t.durationMs)
    );
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: ReadonlyArray<Toast> }) {
  if (toasts.length === 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 90,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          data-testid="kudos-toast"
          data-variant={t.variant}
          style={{
            background: "var(--color-kudos-toast-bg, rgba(0,16,26,0.95))",
            color: "var(--color-text-white, #ffffff)",
            padding: "12px 16px",
            minWidth: 280,
            borderRadius: 8,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
