"use client";

import type { MouseEvent } from "react";
import Icon from "@/components/ui/Icon";
import type { AwardSlug } from "@/types/awards";

type Props = {
  slug: AwardSlug;
  label: string;
  isActive: boolean;
  onNavigate: (slug: AwardSlug) => void;
};

export default function AwardsSidebarItem({
  slug,
  label,
  isActive,
  onNavigate,
}: Props) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate(slug);
  }

  return (
    <a
      href={`#${slug}`}
      aria-current={isActive ? "location" : undefined}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
        padding: "var(--space-awards-sidebar-pad, 16px)",
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 150ms ease-out, text-shadow 150ms ease-out",
        color: isActive
          ? "var(--color-text-gold)"
          : "var(--color-text-white)",
        textShadow: isActive ? "var(--text-shadow-glow)" : "none",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.15px",
      }}
    >
      <Icon
        src="/assets/icons/target.svg"
        size={24}
        alt=""
        aria-hidden="true"
        style={{ opacity: isActive ? 1 : 0.7 }}
      />
      <span
        style={{
          borderBottom: isActive
            ? "1px solid var(--color-border-gold)"
            : "1px solid transparent",
          paddingBottom: "2px",
        }}
      >
        {label}
      </span>
    </a>
  );
}
