"use client";

import { useTranslations } from "next-intl";

export default function SkipLink() {
  const t = useTranslations("common");

  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        padding: "12px 16px",
        background: "var(--color-btn-primary-bg)",
        color: "var(--color-text-on-btn)",
        fontFamily: "var(--font-montserrat)",
        fontSize: "14px",
        fontWeight: 700,
        textDecoration: "none",
        borderRadius: "0 0 4px 0",
        transform: "translateY(-200%)",
        zIndex: 70,
        transition: "transform 150ms ease-out",
      }}
      onFocus={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.transform = "translateY(-200%)";
      }}
    >
      {t("skip_to_main")}
    </a>
  );
}
