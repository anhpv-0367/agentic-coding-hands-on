"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import type { AwardCategory } from "@/types/homepage";

type Props = {
  category: AwardCategory;
};

export default function AwardCard({ category }: Props) {
  const t = useTranslations("homepage.awards");
  const [isHovered, setIsHovered] = useState(false);

  const title = t(`categories.${category.i18nKey}.title`);
  const description = t(`categories.${category.i18nKey}.description`);
  const detailsCta = t("details_cta");

  return (
    <Link
      href={`/awards#${category.slug}`}
      aria-label={`${title}. ${detailsCta}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        textDecoration: "none",
        color: "inherit",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 250ms ease-out",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "8px",
          overflow: "hidden",
          isolation: "isolate",
          border: "1px solid var(--color-border-gold)",
          boxShadow: isHovered
            ? "var(--shadow-gold-glow-strong)"
            : "var(--shadow-gold-glow)",
          background: "var(--color-bg-page)",
          transition: "box-shadow 250ms ease-out",
        }}
      >
        <img
          src="/assets/homepage/images/awards/award-bg-glow.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "screen",
            borderRadius: "inherit",
          }}
        />
        <img
          src={category.imageUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "screen",
            borderRadius: "inherit",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h3
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "24px",
            fontWeight: 400,
            lineHeight: "32px",
            color: "var(--color-text-gold)",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "var(--color-text-white)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "16px 0",
            fontFamily: "var(--font-montserrat)",
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "var(--color-text-white)",
          }}
        >
          {detailsCta}
          <Icon
            src="/assets/homepage/icons/arrow-up-right.svg"
            size={16}
            alt=""
            aria-hidden="true"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </span>
      </div>
    </Link>
  );
}
