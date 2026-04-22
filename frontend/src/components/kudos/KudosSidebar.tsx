"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type {
  GiftBoxReward,
  KudosStats,
  LeaderboardEntry,
} from "@/types/kudos";
import KudosStatsCard from "./KudosStatsCard";
import KudosLeaderboard from "./KudosLeaderboard";
import GiftModal from "./GiftModal";

type Props = {
  initialStats: KudosStats;
  tierUpgrades: ReadonlyArray<LeaderboardEntry>;
  giftRecipients: ReadonlyArray<LeaderboardEntry>;
};

export default function KudosSidebar({
  initialStats,
  tierUpgrades,
  giftRecipients,
}: Props) {
  const t = useTranslations("kudos.sidebar");
  const [stats, setStats] = useState<KudosStats>(initialStats);
  const [reward, setReward] = useState<GiftBoxReward | null>(null);

  return (
    <aside
      aria-label={t("stats_title")}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-kudos-sidebar-gap, 24px)",
        width: "100%",
        maxWidth: 422,
      }}
    >
      <KudosStatsCard
        stats={stats}
        onStatsChange={setStats}
        onOpenGift={(r) => setReward(r)}
      />
      <KudosLeaderboard
        title={t("leaderboard_tier_upgrades")}
        entries={tierUpgrades}
      />
      <KudosLeaderboard
        title={t("leaderboard_gift_recipients")}
        entries={giftRecipients}
      />
      <GiftModal reward={reward} onClose={() => setReward(null)} />
    </aside>
  );
}
