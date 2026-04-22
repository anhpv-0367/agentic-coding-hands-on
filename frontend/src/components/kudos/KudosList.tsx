"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Kudo, KudosFilters } from "@/types/kudos";
import { listKudos } from "@/lib/services/kudos-service";
import { useIntersection } from "@/hooks/useIntersection";
import KudosPostCard from "./KudosPostCard";

type Props = {
  initialItems: ReadonlyArray<Kudo>;
  initialCursor: string | null;
  filters?: KudosFilters;
};

export default function KudosList({
  initialItems,
  initialCursor,
  filters,
}: Props) {
  const t = useTranslations("kudos.all");
  const [items, setItems] = useState<Kudo[]>([...initialItems]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef<boolean>(false);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current) return;
    if (cursor === null) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await listKudos({
        cursor: cursor ?? undefined,
        limit: 10,
        hashtag: filters?.hashtag,
        department: filters?.department,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((k) => k.id));
        const additions = res.items.filter((k) => !seen.has(k.id));
        return additions.length ? [...prev, ...additions] : prev;
      });
      setCursor(res.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [cursor, filters?.hashtag, filters?.department]);

  const observerOptions = useMemo(() => ({ rootMargin: "200px" }), []);
  useIntersection(sentinelRef, loadMore, observerOptions);

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-meta, #999999)",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {t("empty")}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="kudos-all-heading"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
      }}
    >
      <h2
        id="kudos-all-heading"
        style={{
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 24,
          fontWeight: 700,
          lineHeight: "32px",
          color: "var(--color-text-gold, #FFEA9E)",
          padding: "0 24px",
        }}
      >
        {t("section_title")}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "center",
          width: "100%",
        }}
      >
        {items.map((kudo) => (
          <KudosPostCard key={kudo.id} kudo={kudo} />
        ))}
      </div>

      {cursor !== null ? (
        <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid var(--color-border-gold, #FFEA9E)",
              color: "var(--color-text-gold, #FFEA9E)",
              padding: "12px 24px",
              borderRadius: 8,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "…" : t("load_more")}
          </button>
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-meta, #999999)",
            margin: 0,
            padding: 24,
          }}
        >
          {t("no_more")}
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            textAlign: "center",
            color: "var(--color-error, #FF6B6B)",
            fontSize: 14,
            fontFamily: "var(--font-montserrat), sans-serif",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}
