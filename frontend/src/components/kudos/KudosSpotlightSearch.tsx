"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type Props = {
  onQueryChange: (query: string) => void;
};

export default function KudosSpotlightSearch({ onQueryChange }: Props) {
  const t = useTranslations("kudos.spotlight");
  const [value, setValue] = useState("");
  const debounced = useDebouncedValue(value, 200);

  useEffect(() => {
    onQueryChange(debounced);
  }, [debounced, onQueryChange]);

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 100,
        border: "1px solid var(--color-border-bronze, #998C5F)",
        background: "rgba(0, 16, 26, 0.3)",
        color: "var(--color-text-white, #FFFFFF)",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: 14,
        fontWeight: 500,
        width: "100%",
        maxWidth: 240,
      }}
    >
      <Icon src="/assets/icons/search.svg" size={16} alt="" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder={t("search_placeholder")}
        aria-label={t("search_placeholder")}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "inherit",
          font: "inherit",
          width: "100%",
          padding: 0,
        }}
      />
    </label>
  );
}
