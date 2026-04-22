import { useTranslations, useLocale } from "next-intl";
import type { AwardCategoryDetail } from "@/types/awards";
import { formatVnd } from "@/lib/format/currency";
import type { Locale } from "@/i18n/config";
import AwardTitleRow from "./AwardTitleRow";
import AwardMetric from "./AwardMetric";
import AwardValueDivider from "./AwardValueDivider";

type Props = {
  detail: AwardCategoryDetail;
};

function DividerRule() {
  return (
    <hr
      aria-hidden="true"
      style={{
        width: "100%",
        height: "1px",
        border: 0,
        margin: 0,
        background: "var(--border-awards-divider-gold-alpha)",
      }}
    />
  );
}

export default function AwardContent({ detail }: Props) {
  const tCard = useTranslations("awards.card");
  const tCategories = useTranslations("awards.categories");
  const tHomepageCategories = useTranslations("homepage.awards.categories");
  const tCurrency = useTranslations("awards.currency");
  const locale = useLocale() as Locale;

  const title = tHomepageCategories(`${detail.i18nKey}.title`);
  const longDescription = tCategories(`${detail.i18nKey}.long_description`);

  const unitLabel = tCard(`unit.${detail.unit}`);
  const currencySuffix = tCurrency("vnd");
  const quantityValue = String(detail.quantity).padStart(2, "0");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--space-awards-card-content-gap, 32px)",
        padding:
          "var(--space-awards-card-content-pad-y, 32px) var(--space-awards-card-content-pad-x, 32px)",
        borderRadius: "16px",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <AwardTitleRow title={title} />

      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          letterSpacing: "0.15px",
          color: "var(--color-text-white)",
          textAlign: "justify",
          width: "100%",
        }}
      >
        {longDescription}
      </p>

      <DividerRule />

      <AwardMetric
        icon="diamond"
        label={tCard("quantity_label")}
        value={quantityValue}
        unit={unitLabel}
      />

      <DividerRule />

      {typeof detail.value === "number" ? (
        <AwardMetric
          icon="license"
          label={tCard("value_label")}
          value={formatVnd(detail.value, locale, currencySuffix)}
          suffix={tCard("value_suffix_per_award")}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-awards-card-content-gap, 32px)",
            width: "100%",
          }}
        >
          <AwardMetric
            icon="license"
            label={tCard("value_label")}
            value={formatVnd(detail.value.individual, locale, currencySuffix)}
            suffix={tCard("value_suffix_per_individual")}
          />
          <AwardValueDivider label={tCard("signature_separator")} />
          <AwardMetric
            icon="license"
            label={tCard("value_label")}
            value={formatVnd(detail.value.team, locale, currencySuffix)}
            suffix={tCard("value_suffix_per_team")}
          />
        </div>
      )}
    </div>
  );
}
