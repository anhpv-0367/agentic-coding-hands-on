"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { computeRemaining, msUntilNextMinute } from "@/lib/utils/countdown";
import type { CountdownValues } from "@/types/homepage";
import CountdownUnit from "./CountdownUnit";

type Size = "default" | "large";

type Props = {
  targetIso: string;
  size?: Size;
};

const UNIT_ROW_GAP: Record<Size, string> = {
  default: "40px",
  large: "60px",
};

export default function Countdown({ targetIso, size = "default" }: Props) {
  const t = useTranslations("homepage.hero");
  const target = useMemo(() => new Date(targetIso), [targetIso]);
  const isValidTarget = Number.isFinite(target.getTime());

  const [remaining, setRemaining] = useState<CountdownValues>(() => {
    if (!isValidTarget) return { days: 0, hours: 0, minutes: 0, isPast: true };
    return computeRemaining(target, new Date());
  });

  useEffect(() => {
    if (!isValidTarget) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function update() {
      setRemaining(computeRemaining(target, new Date()));
    }

    function scheduleBoundaryAligned() {
      if (timeoutId) clearTimeout(timeoutId);
      const delay = msUntilNextMinute(new Date());
      timeoutId = setTimeout(() => {
        update();
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(update, 60_000);
      }, delay);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        update();
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        scheduleBoundaryAligned();
      } else {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    update();
    scheduleBoundaryAligned();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [target, isValidTarget]);

  if (!isValidTarget) {
    return null;
  }

  const ariaLabel = t("countdown.aria_label", {
    days: remaining.days,
    hours: remaining.hours,
    minutes: remaining.minutes,
  });

  const showComingSoon = size === "default" && !remaining.isPast;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: size === "large" ? "center" : "flex-start",
      }}
    >
      {showComingSoon && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: "32px",
            color: "var(--color-text-gold)",
          }}
        >
          {t("coming_soon")}
        </span>
      )}
      <div style={{ display: "flex", gap: UNIT_ROW_GAP[size] }}>
        <CountdownUnit value={remaining.days} label={t("countdown.days")} size={size} />
        <CountdownUnit value={remaining.hours} label={t("countdown.hours")} size={size} />
        <CountdownUnit value={remaining.minutes} label={t("countdown.minutes")} size={size} />
      </div>
    </div>
  );
}
