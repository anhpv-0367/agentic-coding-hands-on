import { useTranslations } from "next-intl";
import type { LeaderboardEntry } from "@/types/kudos";
import TierBadge from "./TierBadge";

type Props = {
  title: string;
  entries: ReadonlyArray<LeaderboardEntry>;
};

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  if (entry.user.avatar_url) {
    return (
      <img
        src={entry.user.avatar_url}
        alt=""
        width={40}
        height={40}
        style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "rgba(255, 234, 158, 0.2)",
        color: "#FFEA9E",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 700,
      }}
    >
      {entry.user.display_name.charAt(0)}
    </span>
  );
}

export default function KudosLeaderboard({ title, entries }: Props) {
  const t = useTranslations("kudos.sidebar");

  return (
    <section
      style={{
        width: "100%",
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
          lineHeight: "24px",
          letterSpacing: "0.15px",
          color: "var(--color-text-gold, #FFEA9E)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
      {entries.length === 0 ? (
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            color: "var(--color-text-meta, #999999)",
          }}
        >
          {t("empty")}
        </p>
      ) : (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map((entry) => (
            <li
              key={entry.user.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "var(--font-montserrat), sans-serif",
                color: "var(--color-text-white, #FFFFFF)",
              }}
            >
              <Avatar entry={entry} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px" }}>
                    {entry.user.display_name}
                  </span>
                  <TierBadge tier={entry.user.tier} />
                </div>
                <span
                  style={{
                    fontSize: 10.9,
                    fontWeight: 500,
                    lineHeight: "16.4px",
                    color: "var(--color-text-meta, #999999)",
                  }}
                >
                  {entry.description}
                  {entry.meta ? ` · ${entry.meta}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
