"use client";

import { useTranslations } from "next-intl";
import type { Kudo } from "@/types/kudos";
import HeartButton from "./HeartButton";
import CopyLinkButton from "./CopyLinkButton";

type Props = {
  kudo: Kudo;
  variant?: "highlight" | "post";
};

export default function KudoActionRow({ kudo, variant = "highlight" }: Props) {
  const t = useTranslations("kudos.post");
  const onCreamCard = variant === "post";
  const linkColor = onCreamCard
    ? "var(--color-text-tag-red, #D4271D)"
    : "var(--color-text-gold, #FFEA9E)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingTop: 8,
        borderTop: onCreamCard
          ? "var(--border-kudos-card-divider, 1px solid #2E3940)"
          : "1px solid rgba(255, 234, 158, 0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <HeartButton
          kudoId={kudo.id}
          initialCount={kudo.heart_count}
          initialLiked={kudo.liked_by_me}
          onCreamCard={onCreamCard}
        />
        <CopyLinkButton shareUrl={kudo.share_url} onCreamCard={onCreamCard} />
      </div>
      <a
        href={kudo.share_url}
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: linkColor,
          textDecoration: "underline",
        }}
      >
        {t("view_detail")}
      </a>
    </div>
  );
}
