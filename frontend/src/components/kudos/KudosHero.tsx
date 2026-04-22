import { getTranslations } from "next-intl/server";
import VisuallyHidden from "@/components/ui/VisuallyHidden";

export default async function KudosHero() {
  const t = await getTranslations("kudos.page");

  return (
    <section
      aria-labelledby="kudos-page-title"
      style={{
        position: "relative",
        width: "100%",
        height: "var(--space-kudos-hero-height, 512px)",
        backgroundImage: "url('/assets/kudos/kv-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      <VisuallyHidden as="h1" id="kudos-page-title">
        {t("sr_h1")}
      </VisuallyHidden>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="px-6 md:px-12 lg:px-36"
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: "44px",
            color: "var(--color-text-white, #FFFFFF)",
          }}
        >
          {t("hero_subtitle")}
        </span>
        {}
        <img
          src="/assets/kudos/saa-kudos-wordmark.svg"
          alt=""
          aria-hidden="true"
          style={{
            width: "min(593px, 80%)",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </section>
  );
}
