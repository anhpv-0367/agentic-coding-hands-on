"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Icon from "@/components/ui/Icon";

type Props = {
  label: string;
  /** Options in display order. */
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string | null;
  onChange: (next: string | null) => void;
  /** Placeholder for the "no filter" option. */
  allLabel: string;
};

export default function FilterDropdown({ label, options, value, onChange, allLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const allOptions = [{ value: "", label: allLabel }, ...options];
  const currentLabel =
    value === null || value === "" ? label : options.find((o) => o.value === value)?.label ?? label;

  const select = useCallback(
    (next: string) => {
      onChange(next === "" ? null : next);
      setOpen(false);
    },
    [onChange]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((i) => Math.min(allOptions.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(allOptions[focusedIndex].value);
    }
  };

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          minWidth: 140,
          height: 40,
          borderRadius: 8,
          border: "1px solid var(--color-border-bronze, #998C5F)",
          background: "transparent",
          color: "var(--color-text-white, #FFFFFF)",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: "20px",
          letterSpacing: "0.1px",
          cursor: "pointer",
        }}
      >
        <span>{currentLabel}</span>
        <Icon
          src="/assets/icons/chevron-down.svg"
          size={16}
          alt=""
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease-out",
            marginLeft: "auto",
          }}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: 220,
            maxHeight: 320,
            overflowY: "auto",
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "var(--color-dropdown-bg, rgba(11, 15, 18, 0.95))",
            border: "1px solid var(--color-divider, #2E3940)",
            borderRadius: 8,
            zIndex: 60,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          {allOptions.map((opt, idx) => {
            const selected = (value ?? "") === opt.value;
            const focused = idx === focusedIndex;
            return (
              <li
                key={opt.value || "__all__"}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onMouseEnter={() => setFocusedIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(opt.value);
                }}
                style={{
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: focused
                    ? "var(--color-gold-hover-bg, rgba(255, 234, 158, 0.1))"
                    : "transparent",
                  color: selected
                    ? "var(--color-text-gold, #FFEA9E)"
                    : "var(--color-text-white, #FFFFFF)",
                  cursor: "pointer",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
