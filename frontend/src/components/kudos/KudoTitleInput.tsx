"use client";

import { useId } from "react";
import FieldLabel from "./FieldLabel";

type Props = {
  label: string;
  placeholder: string;
  hintExample: string;
  hintDisplay: string;
  errorMessage?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

export default function KudoTitleInput({
  label,
  placeholder,
  hintExample,
  hintDisplay,
  errorMessage,
  value,
  onChange,
  maxLength = 80,
}: Props) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel htmlFor={inputId} required>
        {label}
      </FieldLabel>
      <input
        id={inputId}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-required="true"
        aria-invalid={errorMessage ? "true" : "false"}
        aria-describedby={errorMessage ? errorId : hintId}
        maxLength={maxLength}
        data-testid="kudos-compose-title"
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 56,
          padding: "16px 24px",
          background: "var(--color-bg-input, #FFFFFF)",
          border: errorMessage
            ? "1px solid var(--color-required-asterisk, #CF1322)"
            : "1px solid var(--color-border-bronze, #998C5F)",
          borderRadius: "var(--radius-compose-input, 8px)",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "var(--text-kudos-compose-input-size, 16px)",
          fontWeight: 500,
          lineHeight: "var(--text-kudos-compose-input-line-height, 24px)",
          color: "var(--color-text-on-btn, #00101A)",
          outline: "none",
        }}
      />
      <div
        id={hintId}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 14,
          lineHeight: "20px",
          color: "var(--color-text-meta-on-card, #666666)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span>{hintExample}</span>
          <span>{hintDisplay}</span>
        </div>
        <span
          aria-hidden="true"
          style={{
            whiteSpace: "nowrap",
            color:
              value.length > maxLength
                ? "var(--color-required-asterisk, #CF1322)"
                : "var(--color-text-meta, #999999)",
          }}
        >
          {value.length}/{maxLength}
        </span>
      </div>
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-required-asterisk, #CF1322)",
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
