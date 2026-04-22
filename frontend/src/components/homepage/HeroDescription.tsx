import { getTranslations } from "next-intl/server";

export default async function HeroDescription() {
  const t = await getTranslations("homepage.hero");

  const paragraphStyle = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "24px",
    letterSpacing: "0.5px",
    color: "var(--color-text-white)",
    margin: 0,
  } as const;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      <p style={paragraphStyle}>{t("description_p1")}</p>
      <p style={paragraphStyle}>{t("description_p2")}</p>
      <p style={paragraphStyle}>{t("description_p3")}</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "8px",
          marginBottom: "8px",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "var(--color-text-white)",
            margin: 0,
          }}
        >
          {t("description_quote")}
        </p>
        <p
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "20px",
            letterSpacing: "0.1px",
            color: "var(--color-text-white)",
            margin: 0,
            opacity: 0.8,
          }}
        >
          {t("description_quote_translation")}
        </p>
      </div>

      <p style={paragraphStyle}>{t("description_p4")}</p>
      <p style={paragraphStyle}>{t("description_p5")}</p>
    </div>
  );
}
