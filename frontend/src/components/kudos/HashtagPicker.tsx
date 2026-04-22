"use client";

import { useId, useState } from "react";
import FieldLabel from "./FieldLabel";

type Props = {
  label: string;
  addLabel: string;
  maxHint: string;
  placeholder: string;
  duplicateMessage: string;
  removeAriaFor: (tag: string) => string;
  errorMessage?: string;
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
};

const HASHTAG_RE = /^[\p{L}\p{N}_ -]{1,32}$/u;

export default function HashtagPicker({
  label,
  addLabel,
  maxHint,
  placeholder,
  duplicateMessage,
  removeAriaFor,
  errorMessage,
  value,
  onChange,
  maxTags = 5,
}: Props) {
  const labelId = useId();
  const errorId = useId();
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const atLimit = value.length >= maxTags;
  const effectiveError = localError ?? errorMessage ?? null;

  const commit = () => {
    const tag = input.trim();
    setLocalError(null);
    if (!tag) return;
    if (!HASHTAG_RE.test(tag)) {
      return;
    }
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setLocalError(duplicateMessage);
      setInput("");
      return;
    }
    onChange([...value, tag]);
    setInput("");
  };

  const remove = (index: number) => {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel required>{label}</FieldLabel>
      <div
        aria-labelledby={labelId}
        aria-describedby={effectiveError ? errorId : undefined}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-compose-chip-gap, 8px)",
          alignItems: "center",
        }}
      >
        {value.map((tag, index) => (
          <span
            key={tag}
            data-testid="kudos-compose-hashtag-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "#FFFFFF",
              border: "1px solid var(--color-border-bronze, #998C5F)",
              borderRadius: "var(--radius-compose-input, 8px)",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: "20px",
              color: "var(--color-text-tag-red, #D4271D)",
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={removeAriaFor(tag)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                color: "var(--color-text-tag-red, #D4271D)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M3 3 L9 9 M9 3 L3 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        ))}

        {showInput && !atLimit && (
          <input
            autoFocus
            type="text"
            value={input}
            placeholder={placeholder}
            data-testid="kudos-compose-hashtag-input"
            onChange={(e) => {
              setInput(e.target.value);
              setLocalError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                setInput("");
                setShowInput(false);
              }
            }}
            onBlur={() => {
              commit();
              setShowInput(false);
            }}
            style={{
              height: 48,
              padding: "4px 12px",
              border: "1px solid var(--color-border-bronze, #998C5F)",
              borderRadius: "var(--radius-compose-input, 8px)",
              background: "#FFFFFF",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "20px",
              color: "var(--color-text-on-btn, #00101A)",
              outline: "none",
              minWidth: 180,
            }}
          />
        )}

        {!atLimit && !showInput && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            data-testid="kudos-compose-hashtag-add"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 48,
              padding: "4px 12px",
              background: "#FFFFFF",
              border: "1px solid var(--color-border-bronze, #998C5F)",
              borderRadius: "var(--radius-compose-input, 8px)",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: "20px",
              color: "var(--color-text-on-btn, #00101A)",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 2 V14 M2 8 H14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {addLabel}
          </button>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 14,
          color: "var(--color-text-meta-on-card, #666666)",
        }}
      >
        {maxHint}
      </p>
      {effectiveError && (
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
          {effectiveError}
        </p>
      )}
    </div>
  );
}
