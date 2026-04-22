import { headers } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import type {
  Kudo,
  KudoListResponse,
  KudosFilterOptions,
  KudosStats,
  LeaderboardEntry,
  SpotlightFeedResponse,
} from "@/types/kudos";
import type { UserRole } from "@/types/homepage";
import KudosHero from "./KudosHero";
import KudosPageClient from "./KudosPageClient";

type Props = {
  user: {
    avatarUrl: string | null;
    role: UserRole;
  };
};

async function fetchJson<T>(
  origin: string,
  path: string,
  cookie: string,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(`${origin}${path}`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

const EMPTY_STATS: KudosStats = {
  received: 0,
  sent: 0,
  hearts: 0,
  boxes_opened: 0,
  boxes_unopened: 0,
  tier: "new",
};

export default async function KudosPage({ user }: Props) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const cookie = headerList.get("cookie") ?? "";

  const [
    highlights,
    kudosPage,
    spotlight,
    stats,
    tierUpgrades,
    giftRecipients,
    filterOptions,
  ] = await Promise.all([
    fetchJson<Kudo[]>(origin, "/api/kudos/highlights", cookie, []),
    fetchJson<KudoListResponse>(origin, "/api/kudos?limit=10", cookie, {
      items: [],
      next_cursor: null,
    }),
    fetchJson<SpotlightFeedResponse>(
      origin,
      "/api/kudos/spotlight-feed?limit=118",
      cookie,
      { total: 0, nodes: [] }
    ),
    fetchJson<KudosStats>(origin, "/api/kudos/stats/me", cookie, EMPTY_STATS),
    fetchJson<LeaderboardEntry[]>(
      origin,
      "/api/kudos/leaderboard/tier-upgrades?limit=10",
      cookie,
      []
    ),
    fetchJson<LeaderboardEntry[]>(
      origin,
      "/api/kudos/leaderboard/gift-recipients?limit=10",
      cookie,
      []
    ),
    fetchJson<KudosFilterOptions>(origin, "/api/kudos/filters", cookie, {
      hashtags: [],
      departments: [],
    }),
  ]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflowX: "clip",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SkipLink />
      <Header variant="full" selectedNav="kudos" user={user} />

      <KudosHero />

      <main
        id="main-content"
        className="px-5 md:px-12 lg:px-36"
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          paddingTop: 64,
          paddingBottom: 96,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-kudos-section-gap, 80px)",
        }}
      >
        <KudosPageClient
          initialHighlights={highlights}
          initialSpotlight={spotlight}
          initialKudos={kudosPage.items}
          initialKudosCursor={kudosPage.next_cursor}
          initialStats={stats}
          initialTierUpgrades={tierUpgrades}
          initialGiftRecipients={giftRecipients}
          initialFilterOptions={filterOptions}
        />
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
