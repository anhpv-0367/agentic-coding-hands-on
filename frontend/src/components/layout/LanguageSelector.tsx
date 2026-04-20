"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";

const FLAG_MAP: Record<Locale, { src: string; label: string }> = {
  vi: { src: "/assets/login/icons/flag-vn.svg", label: "VN" },
  en: { src: "/assets/login/icons/flag-us.svg", label: "EN" },
};

export default function LanguageSelector() {
  const t = useTranslations("login.aria");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = FLAG_MAP[locale] ?? FLAG_MAP.vi;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectLocale(newLocale: Locale) {
    setIsOpen(false);
    router.replace(pathname, { scroll: false });
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        aria-label={t("language_selector")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        style={{
          width: "108px",
          height: "56px",
          padding: "16px",
          borderRadius: "4px",
          border: "none",
          background: isOpen ? "rgba(255,255,255,0.12)" : "transparent",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          cursor: "pointer",
          color: "var(--color-text-white)",
          fontFamily: "var(--font-montserrat)",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          letterSpacing: "0.15px",
          transition: "background 150ms ease-out",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen)
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <Icon src={current.src} size={24} alt={current.label} />
        <span style={{ flex: 1, textAlign: "center" }}>{current.label}</span>
        <Icon
          src="/assets/login/icons/chevron-down.svg"
          size={24}
          alt=""
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease-out",
          }}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t("language_selector")}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "rgba(11, 15, 18, 0.95)",
            borderRadius: "4px",
            minWidth: "108px",
            padding: "4px 0",
            zIndex: 100,
          }}
        >
          {(Object.entries(FLAG_MAP) as [Locale, { src: string; label: string }][]).map(
            ([loc, { src, label }]) => (
              <button
                key={loc}
                role="option"
                aria-selected={loc === locale}
                onClick={() => selectLocale(loc)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selectLocale(loc);
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  background: "transparent",
                  color: "var(--color-text-white)",
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <Icon src={src} size={24} alt={label} />
                <span>{label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
