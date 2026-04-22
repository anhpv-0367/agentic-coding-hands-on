import { getTranslations } from "next-intl/server";

export default async function EventInfo() {
  const t = await getTranslations("homepage.hero");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        className="flex flex-col md:flex-row md:items-baseline md:gap-8"
        style={{ gap: "8px" }}
      >
        <InfoRow
          label={t("event_time_label")}
          value={t("event_time_value")}
        />
        <InfoRow
          label={t("event_location_label")}
          value={t("event_location_value")}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-montserrat)",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "24px",
          letterSpacing: "0.5px",
          color: "var(--color-text-white)",
          margin: 0,
        }}
      >
        {t("event_broadcast_note")}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
      <span
        style={{
          fontFamily: "var(--font-montserrat)",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "24px",
          letterSpacing: "0.5px",
          color: "var(--color-text-white)",
          opacity: 0.8,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-montserrat)",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          letterSpacing: "0.15px",
          color: "var(--color-text-white)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
