"use client";

import type { Kudo } from "@/types/kudos";
import KudosHighlightCard from "./KudosHighlightCard";

type Props = {
  kudos: ReadonlyArray<Kudo>;
  activeIndex: number;
};

export default function KudosHighlightsCarousel({ kudos, activeIndex }: Props) {
  if (kudos.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
      aria-roledescription="carousel"
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 24,
          transition: "transform 300ms ease-out",
          transform: `translateX(calc(50% - ${activeIndex} * (853px + 24px) - 426px))`,
          padding: "0 24px",
        }}
      >
        {kudos.map((k, i) => (
          <div
            key={k.id}
            style={{
              flex: "0 0 853px",
              maxWidth: "90vw",
            }}
            aria-hidden={i !== activeIndex ? "true" : undefined}
          >
            <KudosHighlightCard kudo={k} isActive={i === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
