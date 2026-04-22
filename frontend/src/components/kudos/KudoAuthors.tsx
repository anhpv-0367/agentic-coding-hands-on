import { useTranslations } from "next-intl";
import type { Kudo, UserRef } from "@/types/kudos";
import KudoAvatarPair from "./KudoAvatarPair";
import TierBadge from "./TierBadge";

type Props = {
  kudo: Kudo;
  /** Cream card bg → use darker meta color. Dark bg → keep lighter gray. */
  onCreamCard?: boolean;
};

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${MM}/${DD}/${yyyy}`;
  } catch {
    return iso;
  }
}

export default function KudoAuthors({ kudo, onCreamCard = false }: Props) {
  const t = useTranslations("kudos.compose");
  const metaColor = onCreamCard
    ? "var(--color-text-meta-on-card, #666666)"
    : "var(--color-text-meta, #999999)";
  const nameColor = onCreamCard
    ? "var(--color-text-on-btn, #00101A)"
    : "var(--color-text-white, #FFFFFF)";

  const anonymousSender: UserRef = {
    id: "anonymous",
    display_name: t("anonymous_display_name"),
    avatar_url: null,
    tier: "new",
  };
  const senderForDisplay = kudo.is_anonymous ? anonymousSender : kudo.sender;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: "var(--font-montserrat), sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <KudoAvatarPair sender={senderForDisplay} recipient={kudo.recipient} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              color: nameColor,
            }}
          >
            {senderForDisplay.display_name}{" "}
            <span style={{ opacity: 0.6, fontWeight: 500 }}>→</span>{" "}
            {kudo.recipient.display_name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TierBadge tier={kudo.recipient.tier} />
            <span
              style={{
                fontSize: 10.9,
                fontWeight: 500,
                lineHeight: "16.4px",
                letterSpacing: "0.1px",
                color: metaColor,
              }}
            >
              {formatTimestamp(kudo.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
