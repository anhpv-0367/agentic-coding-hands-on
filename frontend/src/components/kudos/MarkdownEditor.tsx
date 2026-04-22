"use client";

import { useId } from "react";

type Props = {
  placeholder: string;
  hint: string;
  minLengthHint: string;
  errorMessage?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

const MIN_LENGTH = 10;

export default function MarkdownEditor({
  placeholder,
  hint,
  minLengthHint,
  errorMessage,
  value,
  onChange,
  maxLength = 2000,
}: Props) {
  const textareaId = useId();
  const hintId = useId();
  const errorId = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        id={textareaId}
        value={value}
        placeholder={placeholder}
        aria-required="true"
        aria-invalid={errorMessage ? "true" : "false"}
        aria-describedby={errorMessage ? errorId : hintId}
        data-testid="kudos-compose-message"
        maxLength={maxLength}
        rows={6}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          minHeight: 200,
          maxHeight: 400,
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
          resize: "vertical",
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
        <span>
          {hint}
          {value.length > 0 && value.length < MIN_LENGTH && (
            <>
              {" · "}
              <span style={{ color: "var(--color-required-asterisk, #CF1322)" }}>
                {minLengthHint}
              </span>
            </>
          )}
        </span>
        <span
          aria-hidden="true"
          style={{
            whiteSpace: "nowrap",
            color:
              value.length > maxLength || (value.length > 0 && value.length < MIN_LENGTH)
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
