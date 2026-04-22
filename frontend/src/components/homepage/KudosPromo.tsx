import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";

export default async function KudosPromo() {
  const t = await getTranslations("homepage.kudos");

  return (
    <section
      aria-labelledby="kudos-heading"
      className="flex flex-col lg:flex-row"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "500px",
        borderRadius: "16px",
        backgroundColor: "var(--color-bg-sunkudos-media)",
        backgroundImage: "url('/assets/homepage/images/kudos-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        padding: "64px",
        gap: "32px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          maxWidth: "457px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: "32px",
              color: "var(--color-text-white)",
            }}
          >
            {t("label")}
          </span>
          <h2
            id="kudos-heading"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "57px",
              fontWeight: 700,
              lineHeight: "64px",
              letterSpacing: "-0.25px",
              color: "var(--color-text-gold)",
              margin: 0,
            }}
          >
            {t("title")}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.15px",
              color: "var(--color-text-white)",
              margin: 0,
            }}
          >
            {t("body")}
          </p>
        </div>
        <Link
          href="/kudos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "16px",
            minWidth: "127px",
            height: "56px",
            borderRadius: "4px",
            background: "var(--color-btn-primary-bg)",
            color: "var(--color-text-on-btn)",
            fontFamily: "var(--font-montserrat)",
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            textDecoration: "none",
            width: "fit-content",
            boxShadow: "var(--shadow-gold-glow)",
          }}
        >
          <span>{t("cta")}</span>
          <Icon
            src="/assets/homepage/icons/arrow-up-right.svg"
            size={20}
            alt=""
            aria-hidden="true"
            style={{ filter: "brightness(0)" }}
          />
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="hidden lg:flex"
        style={{
          position: "absolute",
          right: "64px",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.9,
        }}
      >
        <Icon
          src="/assets/homepage/wordmarks/kudos.svg"
          size={0}
          width={310}
          height={67}
          alt=""
          aria-hidden="true"
          style={{ width: "310px", height: "auto" }}
        />
      </div>
    </section>
  );
}
