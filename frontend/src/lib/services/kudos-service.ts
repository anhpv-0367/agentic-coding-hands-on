import type {
  ComposeDraftPayload,
  Kudo,
  KudoDraft,
  KudoListResponse,
  KudosFilterOptions,
  KudosFilters,
  KudosStats,
  LeaderboardEntry,
  SpotlightFeedResponse,
  UserRef,
  GiftBoxReward,
} from "@/types/kudos";

export class KudosServiceError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "KudosServiceError";
    this.status = status;
    this.code = code;
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const code =
      typeof body === "object" && body !== null && "code" in body
        ? String((body as { code: unknown }).code)
        : undefined;
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : res.statusText;
    throw new KudosServiceError(res.status, message, code);
  }
  return (await res.json()) as T;
}

const jsonHeaders = { "Content-Type": "application/json" };

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.set(k, String(v));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export async function getHighlights(signal?: AbortSignal): Promise<Kudo[]> {
  const res = await fetch("/api/kudos/highlights", { signal });
  return parse<Kudo[]>(res);
}

export async function listKudos(
  params: { cursor?: string; limit?: number } & KudosFilters = {},
  signal?: AbortSignal
): Promise<KudoListResponse> {
  const res = await fetch(
    `/api/kudos${qs({
      cursor: params.cursor,
      limit: params.limit,
      hashtag: params.hashtag,
      department: params.department,
    })}`,
    { signal }
  );
  return parse<KudoListResponse>(res);
}

export async function getKudo(id: string, signal?: AbortSignal): Promise<Kudo> {
  const res = await fetch(`/api/kudos/${encodeURIComponent(id)}`, { signal });
  return parse<Kudo>(res);
}

export async function addReaction(kudoId: string): Promise<{ heart_count: number }> {
  const res = await fetch(`/api/kudos/${encodeURIComponent(kudoId)}/reactions`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ type: "heart" }),
  });
  return parse<{ heart_count: number }>(res);
}

export async function removeReaction(kudoId: string): Promise<{ heart_count: number }> {
  const res = await fetch(`/api/kudos/${encodeURIComponent(kudoId)}/reactions`, {
    method: "DELETE",
  });
  return parse<{ heart_count: number }>(res);
}

export async function getSpotlightFeed(
  limit = 118,
  signal?: AbortSignal
): Promise<SpotlightFeedResponse> {
  const res = await fetch(`/api/kudos/spotlight-feed${qs({ limit })}`, { signal });
  return parse<SpotlightFeedResponse>(res);
}

export async function getMyStats(signal?: AbortSignal): Promise<KudosStats> {
  const res = await fetch("/api/kudos/stats/me", { signal });
  return parse<KudosStats>(res);
}

export async function getTierUpgradesLeaderboard(
  limit = 10,
  signal?: AbortSignal
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`/api/kudos/leaderboard/tier-upgrades${qs({ limit })}`, { signal });
  return parse<LeaderboardEntry[]>(res);
}

export async function getGiftRecipientsLeaderboard(
  limit = 10,
  signal?: AbortSignal
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`/api/kudos/leaderboard/gift-recipients${qs({ limit })}`, { signal });
  return parse<LeaderboardEntry[]>(res);
}

export async function getFilterOptions(signal?: AbortSignal): Promise<KudosFilterOptions> {
  const res = await fetch("/api/kudos/filters", { signal });
  return parse<KudosFilterOptions>(res);
}

export async function searchSunners(
  query: string,
  limit = 10,
  signal?: AbortSignal
): Promise<UserRef[]> {
  const res = await fetch(`/api/sunners${qs({ search: query, limit })}`, { signal });
  return parse<UserRef[]>(res);
}

export async function openNextBox(): Promise<GiftBoxReward> {
  const res = await fetch("/api/users/me/boxes/next/open", {
    method: "POST",
    headers: jsonHeaders,
  });
  return parse<GiftBoxReward>(res);
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body });
  return parse<{ url: string }>(res);
}

export async function createKudo(input: {
  recipient_id: string;
  title: string;
  message: string;
  hashtags: string[];
  attachment_urls?: string[];
  is_anonymous: boolean;
}): Promise<Kudo> {
  const res = await fetch("/api/kudos", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
  return parse<Kudo>(res);
}

export async function getDraft(signal?: AbortSignal): Promise<KudoDraft | null> {
  const res = await fetch("/api/kudos/drafts/me", { signal });
  if (res.status === 204) return null;
  return parse<KudoDraft | null>(res);
}

export async function putDraft(payload: ComposeDraftPayload): Promise<KudoDraft> {
  const res = await fetch("/api/kudos/drafts/me", {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ payload }),
  });
  return parse<KudoDraft>(res);
}

export async function deleteDraft(): Promise<void> {
  const res = await fetch("/api/kudos/drafts/me", { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    await parse<unknown>(res);
  }
}
