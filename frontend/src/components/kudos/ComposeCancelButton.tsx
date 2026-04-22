"use client";

type Props = {
  label: string;
  onClick: () => void;
};

export default function ComposeCancelButton({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="kudos-compose-cancel"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 60,
        padding: "var(--space-compose-footer-pad-y, 16px) 40px",
        background: "var(--color-btn-secondary-bg, rgba(255, 234, 158, 0.1))",
        border: "1px solid var(--color-border-bronze, #998C5F)",
        borderRadius: "var(--radius-compose-cancel, 4px)",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "var(--text-kudos-compose-label-size, 22px)",
        fontWeight: 700,
        lineHeight: "var(--text-kudos-compose-label-line-height, 28px)",
        color: "var(--color-text-on-btn, #00101A)",
        cursor: "pointer",
        transition: "border-color 150ms ease-out, background 150ms ease-out",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M5 5 L15 15 M15 5 L5 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
