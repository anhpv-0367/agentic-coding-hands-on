"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { addReaction, removeReaction } from "@/lib/services/kudos-service";

type Props = {
  kudoId: string;
  initialCount: number;
  initialLiked: boolean;
  /** For compact list-card variant with dark text on cream bg. */
  onCreamCard?: boolean;
};

const DEBOUNCE_MS = 500;

export default function HeartButton({
  kudoId,
  initialCount,
  initialLiked,
  onCreamCard = false,
}: Props) {
  const t = useTranslations("kudos.post");
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const lastClickRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  const toggle = useCallback(async () => {
    const now = Date.now();
    if (now - lastClickRef.current < DEBOUNCE_MS) return;
    if (inFlightRef.current) return;
    lastClickRef.current = now;
    inFlightRef.current = true;

    const nextLiked = !liked;
    const prevCount = count;
    const prevLiked = liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = nextLiked ? await addReaction(kudoId) : await removeReaction(kudoId);
      if (typeof res.heart_count === "number") setCount(res.heart_count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      inFlightRef.current = false;
    }
  }, [kudoId, liked, count]);

  const countColor = onCreamCard
    ? liked
      ? "var(--color-kudos-heart-active, #F17676)"
      : "var(--color-text-on-btn, #00101A)"
    : liked
      ? "var(--color-kudos-heart-active, #F17676)"
      : "var(--color-text-white, #FFFFFF)";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? t("liked_aria") : t("unliked_aria")}
      data-liked={liked ? "true" : "false"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        borderRadius: 6,
        transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: "24px",
        color: countColor,
      }}
    >
      {}
      <img
        src="/assets/kudos/heart.svg"
        width={24}
        height={24}
        alt=""
        aria-hidden="true"
        style={{
          filter: liked
            ? "brightness(0) saturate(100%) invert(64%) sepia(23%) saturate(1548%) hue-rotate(313deg) brightness(98%) contrast(91%)"
            : "none",
          opacity: liked ? 1 : 0.75,
          transition: "filter 150ms ease-out, opacity 150ms ease-out",
        }}
      />
      <span>{count}</span>
    </button>
  );
}
