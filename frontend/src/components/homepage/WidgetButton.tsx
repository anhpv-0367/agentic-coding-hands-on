"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";

export default function WidgetButton() {
  const t = useTranslations("homepage.widget");

  return (
    <button
      type="button"
      aria-label={t("button_aria")}
      aria-disabled="true"
      onClick={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        top: "830px",
        right: "19px",
        zIndex: 40,
        padding: "16px",
        height: "64px",
        minWidth: "106px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "var(--color-btn-primary-bg)",
        borderRadius: "100px",
        border: "none",
        boxShadow: "var(--shadow-gold-glow)",
        cursor: "default",
      }}
    >
      <Icon
        src="/assets/homepage/icons/pencil.svg"
        size={24}
        alt=""
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "32px",
          color: "var(--color-text-on-btn)",
        }}
      >
        /
      </span>
      <Icon
        src="/assets/homepage/icons/kudos-logo.svg"
        size={24}
        alt=""
        aria-hidden="true"
      />
    </button>
  );
}
