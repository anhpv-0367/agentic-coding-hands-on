"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  shareUrl: string;
  /** Dark text on cream card vs light text on dark bg. */
  onCreamCard?: boolean;
};

export default function CopyLinkButton({ shareUrl, onCreamCard = false }: Props) {
  const t = useTranslations("kudos.post");
  const { copy } = useClipboard();
  const { showToast } = useToast();

  const onClick = useCallback(async () => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const canonical = shareUrl.startsWith("http") ? shareUrl : `${origin}${shareUrl}`;
    const ok = await copy(canonical);
    if (ok) {
      showToast(t("copy_success_toast"), "success");
    } else {
      showToast(t("copy_error_toast"), "error");
    }
  }, [copy, shareUrl, showToast, t]);

  const color = onCreamCard
    ? "var(--color-text-on-btn, #00101A)"
    : "var(--color-text-white, #FFFFFF)";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sao chép link Kudo"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        borderRadius: 6,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: "20px",
        color,
      }}
    >
      <Icon src="/assets/kudos/link.svg" size={20} alt="" aria-hidden="true" />
      <span>{t("copy_link")}</span>
    </button>
  );
}
