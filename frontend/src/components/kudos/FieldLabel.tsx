"use client";

import type { ReactNode } from "react";

type Props = {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
};

export default function FieldLabel({ htmlFor, required, children }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "var(--text-kudos-compose-label-size, 22px)",
        fontWeight: 700,
        lineHeight: "var(--text-kudos-compose-label-line-height, 28px)",
        color: "var(--color-text-on-btn, #00101A)",
      }}
    >
      <span>{children}</span>
      {required && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: "var(--text-required-asterisk-size, 16px)",
            fontWeight: 700,
            lineHeight: "var(--text-required-asterisk-line-height, 20px)",
            color: "var(--color-required-asterisk, #CF1322)",
          }}
        >
          *
        </span>
      )}
    </label>
  );
}
