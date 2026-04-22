"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Kudo,
  KudoListResponse,
  KudosFilterOptions,
  KudosFilters,
  KudosStats,
  LeaderboardEntry,
  SpotlightFeedResponse,
} from "@/types/kudos";
import ToastProvider from "@/components/ui/ToastProvider";
import { getHighlights, listKudos } from "@/lib/services/kudos-service";
import KudosHighlightsSection from "./KudosHighlightsSection";
import KudosSpotlightBoard from "./KudosSpotlightBoard";
import KudosList from "./KudosList";
import KudosSidebar from "./KudosSidebar";
import KudosFilterBar from "./KudosFilterBar";
import KudosComposeTrigger from "./KudosComposeTrigger";

type Props = {
  initialHighlights: ReadonlyArray<Kudo>;
  initialSpotlight: SpotlightFeedResponse;
  initialKudos: ReadonlyArray<Kudo>;
  initialKudosCursor: string | null;
  initialStats: KudosStats;
  initialTierUpgrades: ReadonlyArray<LeaderboardEntry>;
  initialGiftRecipients: ReadonlyArray<LeaderboardEntry>;
  initialFilterOptions: KudosFilterOptions;
};

function filtersKey(filters: KudosFilters): string {
  return `${filters.hashtag ?? ""}|${filters.department ?? ""}`;
}

export default function KudosPageClient({
  initialHighlights,
  initialSpotlight,
  initialKudos,
  initialKudosCursor,
  initialStats,
  initialTierUpgrades,
  initialGiftRecipients,
  initialFilterOptions,
}: Props) {
  const [filters, setFilters] = useState<KudosFilters>({});
  const [highlights, setHighlights] = useState<ReadonlyArray<Kudo>>(initialHighlights);
  const [listInitial, setListInitial] = useState<{
    items: ReadonlyArray<Kudo>;
    cursor: string | null;
  }>({ items: initialKudos, cursor: initialKudosCursor });

  const isDefaultFilter = !filters.hashtag && !filters.department;

  const applyFilters = useCallback(async (next: KudosFilters) => {
    setFilters(next);
    try {
      const res = await getHighlights();
      setHighlights(res);
    } catch {
      // keep existing
    }
    try {
      const res: KudoListResponse = await listKudos({
        limit: 10,
        hashtag: next.hashtag,
        department: next.department,
      });
      setListInitial({ items: res.items, cursor: res.next_cursor });
    } catch {
      setListInitial({ items: [], cursor: null });
    }
  }, []);

  const refreshAfterCreate = useCallback(() => {
    applyFilters(filters);
  }, [applyFilters, filters]);

  useEffect(() => {
    if (isDefaultFilter) {
      setHighlights(initialHighlights);
      setListInitial({ items: initialKudos, cursor: initialKudosCursor });
    }
  }, [initialHighlights, initialKudos, initialKudosCursor, isDefaultFilter]);

  return (
    <ToastProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-kudos-section-gap, 80px)",
          width: "100%",
          maxWidth: 1152,
          alignSelf: "center",
        }}
      >
        <KudosComposeTrigger onKudoCreated={refreshAfterCreate} />
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <KudosFilterBar
            filters={filters}
            options={initialFilterOptions}
            onChange={applyFilters}
          />
          <KudosHighlightsSection highlights={highlights} />
        </div>
        <KudosSpotlightBoard
          initialTotal={initialSpotlight.total}
          initialNodes={initialSpotlight.nodes}
        />
        <div
          className="flex flex-col lg:flex-row"
          style={{
            gap: "var(--space-kudos-main-col-gap, 40px)",
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
            <KudosList
              key={filtersKey(filters)}
              initialItems={listInitial.items}
              initialCursor={listInitial.cursor}
              filters={filters}
            />
          </div>
          <div
            className="hidden lg:block"
            style={{ flexShrink: 0, width: 422, position: "sticky", top: 104 }}
          >
            <KudosSidebar
              initialStats={initialStats}
              tierUpgrades={initialTierUpgrades}
              giftRecipients={initialGiftRecipients}
            />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
