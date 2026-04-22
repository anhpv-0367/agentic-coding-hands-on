"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";

type Props = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function KudosCarouselControls({ current, total, onPrev, onNext }: Props) {
  const t = useTranslations("kudos.highlight");

  const prevDisabled = current <= 0;
  const nextDisabled = current >= total - 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        padding: "0 24px",
        width: "100%",
      }}
    >
      <button
        type="button"
        aria-label={t("prev_aria")}
        onClick={onPrev}
        disabled={prevDisabled}
        aria-disabled={prevDisabled}
        style={{
          background: "transparent",
          border: "none",
          padding: 8,
          cursor: prevDisabled ? "not-allowed" : "pointer",
          opacity: prevDisabled ? 0.3 : 0.85,
          borderRadius: 999,
        }}
      >
        <Icon src="/assets/kudos/arrow-left.svg" size={24} alt="" aria-hidden="true" />
      </button>
      <span
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "24px",
          color: "var(--color-text-white, #FFFFFF)",
          minWidth: 48,
          textAlign: "center",
        }}
      >
        {t("counter", { current: current + 1, total })}
      </span>
      <button
        type="button"
        aria-label={t("next_aria")}
        onClick={onNext}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        style={{
          background: "transparent",
          border: "none",
          padding: 8,
          cursor: nextDisabled ? "not-allowed" : "pointer",
          opacity: nextDisabled ? 0.3 : 0.85,
          borderRadius: 999,
        }}
      >
        <Icon src="/assets/kudos/arrow-right.svg" size={24} alt="" aria-hidden="true" />
      </button>
    </div>
  );
}
