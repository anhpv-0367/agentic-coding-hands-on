"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SpotlightFeedResponse, SpotlightNode } from "@/types/kudos";
import { getSpotlightFeed } from "@/lib/services/kudos-service";
import { layoutNodes, type PlacedNode } from "@/lib/kudos/spotlight-layout";
import { usePolling } from "@/hooks/usePolling";
import KudosSpotlightSearch from "./KudosSpotlightSearch";

type Props = {
  initialTotal: number;
  initialNodes: ReadonlyArray<SpotlightNode>;
  /** Canvas dimensions (desktop). Responsive scaling handled via CSS `width: 100%`. */
  width?: number;
  height?: number;
  pollIntervalMs?: number;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return iso;
  }
}

export default function KudosSpotlightBoard({
  initialTotal,
  initialNodes,
  width = 1157,
  height = 548,
  pollIntervalMs = 30000,
}: Props) {
  const t = useTranslations("kudos.spotlight");
  const router = useRouter();
  const [nodes, setNodes] = useState<ReadonlyArray<SpotlightNode>>(initialNodes);
  const [total, setTotal] = useState<number>(initialTotal);
  const [searchQuery, setSearchQuery] = useState("");
  const [hovered, setHovered] = useState<PlacedNode | null>(null);

  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const panRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  // Poll every 30s, update nodes/total
  const polled = usePolling<SpotlightFeedResponse>(
    (signal) => getSpotlightFeed(118, signal),
    {
      intervalMs: pollIntervalMs,
      initialData: { total: initialTotal, nodes: [...initialNodes] },
      pauseWhenHidden: true,
    }
  );

  useEffect(() => {
    if (polled.data) {
      setTotal(polled.data.total);
      setNodes(polled.data.nodes);
    }
  }, [polled.data]);

  const layout = useMemo(
    () =>
      layoutNodes({
        nodes: nodes.map((n) => ({ kudo_id: n.kudo_id, label: n.recipient.display_name })),
        bounds: { width, height: height - 64 },
      }),
    [nodes, width, height]
  );

  const lowerQuery = searchQuery.trim().toLowerCase();
  const matches = useMemo(() => {
    if (lowerQuery.length === 0) return null;
    const set = new Set<string>();
    for (const n of nodes) {
      if (n.recipient.display_name.toLowerCase().includes(lowerQuery)) {
        set.add(n.kudo_id);
      }
    }
    return set;
  }, [nodes, lowerQuery]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: transform.x,
      baseY: transform.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [transform.x, transform.y]);

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.active) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setTransform((t) => ({ ...t, x: panRef.current.baseX + dx, y: panRef.current.baseY + dy }));
  }, []);

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    panRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setTransform((t) => {
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.scale * factor));
      return { ...t, scale };
    });
  }, []);

  const onNodeClick = useCallback((kudoId: string) => {
    router.push(`/kudos/${kudoId}`);
  }, [router]);

  const lookupNode = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.kudo_id, n]));
    return (id: string) => map.get(id);
  }, [nodes]);

  return (
    <section
      aria-labelledby="kudos-spotlight-heading"
      style={{
        width: "100%",
        maxWidth: width,
        background: "rgba(0, 16, 26, 0.6)",
        border: "1px solid var(--color-border-bronze, #998C5F)",
        borderRadius: 0,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h2
          id="kudos-spotlight-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 32,
            fontWeight: 700,
            lineHeight: "40px",
            color: "var(--color-text-gold, #FFEA9E)",
            textShadow: "var(--text-shadow-glow)",
          }}
        >
          {t("title", { total })}
        </h2>
        <KudosSpotlightSearch onQueryChange={setSearchQuery} />
      </header>

      {polled.paused && (
        <p style={{ color: "var(--color-text-meta)", fontSize: 14, margin: 0 }}>
          {t("error")} — <button type="button" onClick={polled.resume}>{t("retry")}</button>
        </p>
      )}

      {nodes.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--color-text-meta, #999999)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 16,
          }}
        >
          {t("empty")}
        </div>
      ) : (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          role="presentation"
          style={{
            position: "relative",
            width: "100%",
            height,
            overflow: "hidden",
            touchAction: "none",
            cursor: panRef.current.active ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "center",
              transition: panRef.current.active ? "none" : "transform 150ms ease-out",
            }}
          >
            {layout.map((p) => {
              const node = lookupNode(p.kudo_id);
              if (!node) return null;
              const match = matches === null ? null : matches.has(p.kudo_id);
              return (
                <button
                  key={p.kudo_id}
                  type="button"
                  onClick={() => onNodeClick(p.kudo_id)}
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered((h) => (h?.kudo_id === p.kudo_id ? null : h))}
                  onFocus={() => setHovered(p)}
                  onBlur={() => setHovered((h) => (h?.kudo_id === p.kudo_id ? null : h))}
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: p.width,
                    height: p.height,
                    padding: "2px 6px",
                    background: match === true ? "rgba(255, 234, 158, 0.15)" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: 10.9,
                    fontWeight: 500,
                    lineHeight: "16.4px",
                    color:
                      match === true
                        ? "var(--color-text-gold, #FFEA9E)"
                        : "var(--color-text-white, #FFFFFF)",
                    opacity: match === false ? 0.3 : 1,
                    transform: match === true ? "scale(1.15)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "opacity 150ms ease-out, transform 150ms ease-out",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "left",
                  }}
                >
                  {node.recipient.display_name}
                </button>
              );
            })}
          </div>

          {hovered && lookupNode(hovered.kudo_id) && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "absolute",
                left: hovered.x,
                top: hovered.y - 32,
                padding: "6px 10px",
                background: "var(--color-kudos-tooltip-bg, rgba(0, 16, 26, 0.9))",
                color: "var(--color-text-white, #FFFFFF)",
                borderRadius: 8,
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: 12,
                fontWeight: 500,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {t("tooltip", {
                name: lookupNode(hovered.kudo_id)!.recipient.display_name,
                time: formatRelativeTime(lookupNode(hovered.kudo_id)!.received_at),
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
