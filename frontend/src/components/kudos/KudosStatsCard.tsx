"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import type { KudosStats, GiftBoxReward } from "@/types/kudos";
import { openNextBox } from "@/lib/services/kudos-service";

type Props = {
  stats: KudosStats;
  onOpenGift?: (reward: GiftBoxReward) => void;
  onStatsChange?: (next: KudosStats) => void;
};

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 14,
          fontWeight: 500,
          lineHeight: "20px",
          color: "var(--color-text-white, #FFFFFF)",
          opacity: 0.85,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: "28px",
          color: "var(--color-text-gold, #FFEA9E)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function KudosStatsCard({ stats, onOpenGift, onStatsChange }: Props) {
  const t = useTranslations("kudos.sidebar");
  const [loading, setLoading] = useState(false);

  const canOpen = stats.boxes_unopened > 0;

  const onClick = useCallback(async () => {
    if (!canOpen || loading) return;
    setLoading(true);
    try {
      const reward = await openNextBox();
      onOpenGift?.(reward);
      onStatsChange?.({
        ...stats,
        boxes_opened: stats.boxes_opened + 1,
        boxes_unopened: Math.max(stats.boxes_unopened - 1, 0),
      });
    } finally {
      setLoading(false);
    }
  }, [canOpen, loading, onOpenGift, onStatsChange, stats]);

  return (
    <div
      style={{
        width: "100%",
        background: "var(--color-kudos-stat-card-bg, rgba(255, 234, 158, 0.05))",
        border: "1px solid var(--color-kudos-stat-card-border, rgba(255, 234, 158, 0.2))",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--color-text-white, #FFFFFF)",
        }}
      >
        {t("stats_title")}
      </h3>
      <StatRow label={t("stats_received")} value={stats.received} />
      <StatRow label={t("stats_sent")} value={stats.sent} />
      <StatRow label={t("stats_hearts")} value={stats.hearts} />
      <StatRow label={t("stats_boxes_opened")} value={stats.boxes_opened} />
      <StatRow label={t("stats_boxes_unopened")} value={stats.boxes_unopened} />

      <button
        type="button"
        onClick={onClick}
        disabled={!canOpen || loading}
        aria-disabled={!canOpen || loading}
        style={{
          marginTop: 8,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 48,
          background: canOpen
            ? "var(--color-btn-primary-bg, #FFEA9E)"
            : "rgba(255, 234, 158, 0.4)",
          color: "var(--color-text-on-btn, #00101A)",
          border: "none",
          borderRadius: 4,
          boxShadow: canOpen ? "var(--shadow-gold-glow)" : "none",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 16,
          fontWeight: 700,
          cursor: canOpen && !loading ? "pointer" : "not-allowed",
          opacity: canOpen ? 1 : 0.6,
        }}
      >
        <Icon src="/assets/kudos/open-gift.svg" size={20} alt="" aria-hidden="true" />
        {canOpen ? t("open_gift") : t("open_gift_disabled")}
        {canOpen && stats.boxes_unopened > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              minWidth: 20,
              height: 20,
              padding: "0 6px",
              borderRadius: 10,
              background: "var(--color-status-notification, #D4271D)",
              color: "#FFFFFF",
              fontSize: 10.9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {stats.boxes_unopened}
          </span>
        )}
      </button>
    </div>
  );
}
