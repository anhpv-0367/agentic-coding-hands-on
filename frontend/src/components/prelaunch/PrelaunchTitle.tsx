import { getTranslations } from "next-intl/server";

export default async function PrelaunchTitle() {
  const t = await getTranslations("prelaunch");

  return (
    <h1
      style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "36px",
        fontWeight: 700,
        lineHeight: "48px",
        color: "var(--color-text-white)",
        textAlign: "center",
        margin: 0,
      }}
    >
      {t("title")}
    </h1>
  );
}
