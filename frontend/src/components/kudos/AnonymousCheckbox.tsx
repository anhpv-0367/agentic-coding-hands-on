"use client";

import { useId } from "react";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function AnonymousCheckbox({ label, checked, onChange }: Props) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "var(--text-kudos-compose-label-size, 22px)",
        fontWeight: 700,
        lineHeight: "var(--text-kudos-compose-label-line-height, 28px)",
        color: "var(--color-text-on-btn, #00101A)",
        cursor: "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          background: checked ? "var(--color-btn-primary-bg, #FFEA9E)" : "#FFFFFF",
          border: "1px solid var(--color-text-meta, #999999)",
          borderRadius: "var(--radius-compose-checkbox, 4px)",
          transition: "background 120ms ease-out",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2 6 L5 9 L10 3"
              stroke="#00101A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </span>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        data-testid="kudos-compose-anonymous"
        onChange={(e) => onChange(e.target.checked)}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
      <span>{label}</span>
    </label>
  );
}
