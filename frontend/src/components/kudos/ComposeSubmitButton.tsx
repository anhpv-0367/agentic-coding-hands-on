"use client";

import Icon from "@/components/ui/Icon";

type Props = {
  label: string;
  loadingLabel: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export default function ComposeSubmitButton({
  label,
  loadingLabel,
  disabled,
  loading,
  onClick,
}: Props) {
  const busy = disabled || loading;
  return (
    <button
      type="button"
      onClick={() => {
        if (!busy) onClick();
      }}
      aria-disabled={busy ? "true" : "false"}
      data-testid="kudos-compose-submit"
      style={{
        flex: 1,
        minWidth: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        height: 60,
        padding:
          "var(--space-compose-footer-pad-y, 16px) var(--space-compose-footer-pad-x, 40px)",
        background: busy
          ? "rgba(255, 234, 158, 0.4)"
          : "var(--color-btn-primary-bg, #FFEA9E)",
        color: busy
          ? "rgba(0, 16, 26, 0.5)"
          : "var(--color-text-on-btn, #00101A)",
        border: "none",
        borderRadius: "var(--radius-compose-submit, 8px)",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "var(--text-kudos-compose-label-size, 22px)",
        fontWeight: 700,
        lineHeight: "var(--text-kudos-compose-label-line-height, 28px)",
        cursor: busy ? "not-allowed" : "pointer",
        transition: "background 150ms ease-out",
      }}
    >
      {loading ? (
        <span
          aria-hidden="true"
          data-testid="kudos-compose-submit-spinner"
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid rgba(0,16,26,0.4)",
            borderTopColor: "#00101A",
            animation: "kudos-spin 700ms linear infinite",
          }}
        />
      ) : (
        <Icon src="/assets/kudos/send.svg" size={24} alt="" aria-hidden="true" />
      )}
      <span>{loading ? loadingLabel : label}</span>
      <style>{`@keyframes kudos-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
