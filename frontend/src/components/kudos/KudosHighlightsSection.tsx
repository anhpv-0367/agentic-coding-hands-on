"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Kudo } from "@/types/kudos";
import KudosHighlightsCarousel from "./KudosHighlightsCarousel";
import KudosCarouselControls from "./KudosCarouselControls";

type Props = {
  highlights: ReadonlyArray<Kudo>;
};

export default function KudosHighlightsSection({ highlights }: Props) {
  const t = useTranslations("kudos.highlight");
  const [currentSlide, setCurrentSlide] = useState(0);

  const onPrev = useCallback(
    () => setCurrentSlide((i) => Math.max(0, i - 1)),
    []
  );
  const onNext = useCallback(
    () =>
      setCurrentSlide((i) => Math.min(Math.max(0, highlights.length - 1), i + 1)),
    [highlights.length]
  );

  return (
    <section
      aria-labelledby="kudos-highlight-heading"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 40,
        width: "100%",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "0 24px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: "32px",
            color: "var(--color-text-white, #FFFFFF)",
          }}
        >
          {t("caption")}
        </span>
        <h2
          id="kudos-highlight-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 57,
            fontWeight: 700,
            lineHeight: "64px",
            letterSpacing: "-0.25px",
            color: "var(--color-text-gold, #FFEA9E)",
            textShadow: "var(--text-shadow-glow)",
          }}
        >
          {t("title")}
        </h2>
      </header>

      {highlights.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--color-text-meta, #999999)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {t("empty")}
        </div>
      ) : (
        <>
          <KudosHighlightsCarousel kudos={highlights} activeIndex={currentSlide} />
          <KudosCarouselControls
            current={currentSlide}
            total={highlights.length}
            onPrev={onPrev}
            onNext={onNext}
          />
        </>
      )}
    </section>
  );
}
