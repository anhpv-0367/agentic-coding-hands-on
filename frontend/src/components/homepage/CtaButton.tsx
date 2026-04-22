"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";

type Props = {
  href: string;
  label: string;
  variant: "primary" | "outline";
};

export default function CtaButton({ href, label, variant }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const effectiveVariant: "primary" | "outline" =
    variant === "outline" && isHovered ? "primary" : variant;

  const styles = buttonStyles[effectiveVariant];

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyle,
        ...styles,
      }}
    >
      <span>{label}</span>
      <Icon
        src="/assets/homepage/icons/arrow-up-right.svg"
        size={20}
        alt=""
        aria-hidden="true"
        style={{
          filter:
            effectiveVariant === "primary"
              ? "brightness(0)"
              : "brightness(0) invert(1)",
        }}
      />
    </Link>
  );
}

const baseStyle: CSSProperties = {
  padding: "16px 24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "8px",
  fontFamily: "var(--font-montserrat)",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "28px",
  textDecoration: "none",
  borderRadius: "8px",
  minWidth: "276px",
  height: "60px",
  transition:
    "background-color 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out, box-shadow 200ms ease-out",
};

const buttonStyles: Record<"primary" | "outline", CSSProperties> = {
  primary: {
    background: "var(--color-btn-primary-bg)",
    color: "var(--color-text-on-btn)",
    border: "1px solid transparent",
    boxShadow: "var(--shadow-gold-glow)",
  },
  outline: {
    background: "var(--color-btn-secondary-bg)",
    color: "var(--color-text-white)",
    border: "1px solid var(--color-border-subtle)",
  },
};
