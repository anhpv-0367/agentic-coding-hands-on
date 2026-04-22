"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

export type NavLinkState = "normal" | "selected";

type Props = {
  href: string;
  label: string;
  state: NavLinkState;
  onSelectedClick?: () => void;
};

const BASE_STYLE: CSSProperties = {
  padding: "16px",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  fontFamily: "var(--font-montserrat)",
  fontSize: "14px",
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: "0.1px",
  color: "var(--color-text-white)",
  textDecoration: "none",
  background: "transparent",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 150ms ease-out",
};

export default function NavLink({ href, label, state, onSelectedClick }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = state === "selected";

  const dynamicStyle: CSSProperties = {
    ...BASE_STYLE,
    color: isSelected ? "var(--color-text-gold)" : "var(--color-text-white)",
    textShadow: isSelected ? "var(--text-shadow-glow)" : "none",
    background:
      !isSelected && isHovered ? "var(--color-gold-hover-bg)" : "transparent",
    borderBottom: isSelected
      ? "1px solid var(--color-border-gold)"
      : "1px solid transparent",
  };

  const handleClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (isSelected && onSelectedClick) {
      e.preventDefault();
      onSelectedClick();
    }
  };

  return (
    <Link
      href={href}
      aria-current={isSelected ? "page" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={dynamicStyle}
    >
      {label}
    </Link>
  );
}
