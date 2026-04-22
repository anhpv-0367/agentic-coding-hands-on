import { useTranslations } from "next-intl";
import type { AwardSlug } from "@/types/awards";
import { getAwardDetail } from "@/lib/data/awards-details";
import AwardPicture from "./AwardPicture";
import AwardContent from "./AwardContent";

type Props = {
  slug: AwardSlug;
  /** Zero-based index in the 6-card list. Drives alternating layout. */
  index: number;
};

export default function AwardInfoCard({ slug, index }: Props) {
  const detail = getAwardDetail(slug);
  const tCard = useTranslations("awards.card");
  const tHomepageCategories = useTranslations("homepage.awards.categories");

  const title = tHomepageCategories(`${detail.i18nKey}.title`);
  const alt = tCard("picture_alt", { title });

  const mirror = index % 2 === 1;

  return (
    <section
      id={slug}
      data-award-slug={slug}
      aria-label={title}
      style={{ width: "100%", scrollMarginTop: "104px" }}
    >
      <div
        data-card-root="true"
        data-card-mirror={mirror ? "true" : "false"}
        className={
          mirror
            ? "flex flex-col-reverse lg:flex-row-reverse"
            : "flex flex-col lg:flex-row"
        }
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: "var(--space-awards-card-gap-x, 40px)",
        }}
      >
        <AwardPicture imageUrl={detail.imageUrl} alt={alt} />
        <AwardContent detail={detail} />
      </div>
    </section>
  );
}
