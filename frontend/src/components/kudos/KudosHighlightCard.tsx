import type { Kudo } from "@/types/kudos";
import KudoAuthors from "./KudoAuthors";
import KudoHashtags from "./KudoHashtags";
import KudoActionRow from "./KudoActionRow";

type Props = {
  kudo: Kudo;
  isActive: boolean;
};

export default function KudosHighlightCard({ kudo, isActive }: Props) {
  const chipText = kudo.title ? kudo.title : kudo.hashtags[0] ? `#${kudo.hashtags[0]}` : null;

  return (
    <article
      data-active={isActive ? "true" : "false"}
      aria-current={isActive ? "true" : undefined}
      style={{
        width: "100%",
        maxWidth: 853,
        padding: 24,
        borderRadius: 16,
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        transform: isActive ? "scale(1)" : "scale(0.92)",
        opacity: isActive ? 1 : 0.35,
        transition: "transform 300ms ease-out, opacity 300ms ease-out",
        color: "var(--color-text-white, #FFFFFF)",
      }}
    >
      <KudoAuthors kudo={kudo} />

      {chipText && (
        <span
          style={{
            alignSelf: "flex-start",
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(255, 234, 158, 0.15)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: "20px",
            color: "var(--color-text-gold, #FFEA9E)",
          }}
        >
          {chipText}
        </span>
      )}

      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 20,
          fontWeight: 700,
          lineHeight: "32px",
          color: "var(--color-text-white, #FFFFFF)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {kudo.message}
      </p>

      <KudoHashtags hashtags={kudo.hashtags} maxVisible={5} />

      <KudoActionRow kudo={kudo} variant="highlight" />
    </article>
  );
}
