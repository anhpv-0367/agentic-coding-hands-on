"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchSunners } from "@/lib/services/kudos-service";
import type { UserRef } from "@/types/kudos";
import Icon from "@/components/ui/Icon";
import FieldLabel from "./FieldLabel";

type Props = {
  label: string;
  placeholder: string;
  emptyLabel: string;
  selectHint: string;
  errorMessage?: string;
  value: UserRef | null;
  onChange: (value: UserRef | null) => void;
};

const DEBOUNCE_MS = 200;

export default function RecipientPicker({
  label,
  placeholder,
  emptyLabel,
  selectHint,
  errorMessage,
  value,
  onChange,
}: Props) {
  const inputId = useId();
  const listboxId = useId();
  const errorId = useId();

  const [query, setQuery] = useState<string>(value?.display_name ?? "");
  const [suggestions, setSuggestions] = useState<ReadonlyArray<UserRef>>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (value && query === value.display_name) {
      setSuggestions([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const results = await searchSunners(query, 10, ctrl.signal);
        setSuggestions(results);
        setActiveIndex(results.length > 0 ? 0 : -1);
      } catch {
        // aborted or failed — keep previous results
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, value]);

  const selectItem = (user: UserRef) => {
    onChange(user);
    setQuery(user.display_name);
    setOpen(false);
    setSuggestions([]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        selectItem(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel htmlFor={inputId} required>
        {label}
      </FieldLabel>
      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          type="text"
          value={query}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-required="true"
          aria-invalid={errorMessage ? "true" : "false"}
          aria-describedby={errorMessage ? errorId : undefined}
          data-testid="kudos-compose-recipient"
          onChange={(e) => {
            setQuery(e.target.value);
            if (value && e.target.value !== value.display_name) {
              onChange(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            height: 56,
            padding: "16px 48px 16px 24px",
            background: "var(--color-bg-input, #FFFFFF)",
            border: errorMessage
              ? "1px solid var(--color-required-asterisk, #CF1322)"
              : value
              ? "2px solid var(--color-btn-primary-bg, #FFEA9E)"
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
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            pointerEvents: "none",
            transition: "transform 120ms ease-out",
          }}
        >
          <Icon
            src="/assets/icons/chevron-down.svg"
            size={16}
            alt=""
            aria-hidden="true"
          />
        </div>
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              maxHeight: 320,
              overflowY: "auto",
              background: "var(--color-dropdown-bg, rgba(11,15,18,0.95))",
              border: "1px solid var(--color-divider, #2E3940)",
              borderRadius: 8,
              listStyle: "none",
              margin: 0,
              padding: 4,
              zIndex: 10,
            }}
          >
            {suggestions.length === 0 ? (
              <li
                style={{
                  padding: "12px 16px",
                  color: "var(--color-text-meta, #999999)",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: 14,
                }}
              >
                {emptyLabel}
              </li>
            ) : (
              suggestions.map((user, index) => (
                <li
                  key={user.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectItem(user);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    background:
                      index === activeIndex
                        ? "rgba(255, 234, 158, 0.1)"
                        : "transparent",
                    color:
                      index === activeIndex
                        ? "var(--color-text-gold, #FFEA9E)"
                        : "var(--color-text-white, #FFFFFF)",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {user.display_name}
                  {user.department && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--color-text-meta, #999999)",
                        fontWeight: 500,
                      }}
                    >
                      · {user.department}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {!errorMessage && query.length > 0 && !value && (
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-required-asterisk, #CF1322)",
          }}
        >
          {selectHint}
        </p>
      )}
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
