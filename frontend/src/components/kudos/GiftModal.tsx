"use client";

import Dialog from "@/components/ui/Dialog";
import type { GiftBoxReward } from "@/types/kudos";

type Props = {
  reward: GiftBoxReward | null;
  onClose: () => void;
};

export default function GiftModal({ reward, onClose }: Props) {
  return (
    <Dialog open={reward !== null} onClose={onClose} ariaLabel="Phần thưởng">
      <div
        style={{
          background: "var(--color-bg-page, #00101A)",
          border: "1px solid var(--color-border-gold, #FFEA9E)",
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          maxWidth: 420,
          textAlign: "center",
          fontFamily: "var(--font-montserrat), sans-serif",
          color: "var(--color-text-white, #FFFFFF)",
          boxShadow: "var(--shadow-gold-glow-strong)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {reward && (
          <>
            <span style={{ fontSize: 48 }} aria-hidden="true">
              🎁
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-text-gold, #FFEA9E)",
              }}
            >
              {reward.label}
            </h2>
            {reward.value !== undefined && (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                +{reward.value} {reward.kind}
              </p>
            )}
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 16,
            height: 44,
            background: "var(--color-btn-primary-bg, #FFEA9E)",
            color: "var(--color-text-on-btn, #00101A)",
            border: "none",
            borderRadius: 4,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đóng
        </button>
      </div>
    </Dialog>
  );
}
