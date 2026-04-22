import type { Kudo } from "@/types/kudos";
import KudoAuthors from "./KudoAuthors";
import KudoHashtags from "./KudoHashtags";
import KudoImageGrid from "./KudoImageGrid";
import KudoActionRow from "./KudoActionRow";

type Props = {
  kudo: Kudo;
};

export default function KudosPostCard({ kudo }: Props) {
  return (
    <article
      style={{
        width: "100%",
        maxWidth: 680,
        background: "var(--color-bg-kudos-card, #FFF8E1)",
        borderRadius: 24,
        padding:
          "var(--space-kudos-card-pad-top, 40px) var(--space-kudos-card-pad-x, 40px) var(--space-kudos-card-pad-bottom, 16px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "var(--color-text-on-btn, #00101A)",
      }}
    >
      <KudoAuthors kudo={kudo} onCreamCard={true} />

      <hr
        aria-hidden="true"
        style={{
          width: "100%",
          height: 1,
          border: 0,
          margin: 0,
          background: "var(--color-divider, #2E3940)",
          opacity: 0.2,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {kudo.title && (
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: "28px",
              color: "var(--color-text-on-btn, #00101A)",
            }}
          >
            {kudo.title}
          </h3>
        )}
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: "32px",
            color: "var(--color-text-on-btn, #00101A)",
          }}
        >
          {kudo.message}
        </p>

        <KudoImageGrid images={kudo.attachment_urls} />

        <KudoHashtags hashtags={kudo.hashtags} />
      </div>

      <hr
        aria-hidden="true"
        style={{
          width: "100%",
          height: 1,
          border: 0,
          margin: 0,
          background: "var(--color-divider, #2E3940)",
          opacity: 0.2,
        }}
      />

      <KudoActionRow kudo={kudo} variant="post" />
    </article>
  );
}
