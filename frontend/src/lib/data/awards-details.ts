import type { AwardCategoryDetail, AwardSlug } from "@/types/awards";

export const AWARDS_DETAILS: ReadonlyArray<AwardCategoryDetail> = [
  {
    slug: "top-talent",
    i18nKey: "top_talent",
    imageUrl: "/assets/awards/images/top-talent.png",
    order: 1,
    quantity: 10,
    unit: "individual",
    value: 7_000_000,
    valueMode: "per_award",
  },
  {
    slug: "top-project",
    i18nKey: "top_project",
    imageUrl: "/assets/awards/images/top-project.png",
    order: 2,
    quantity: 2,
    unit: "team",
    value: 15_000_000,
    valueMode: "per_award",
  },
  {
    slug: "top-project-leader",
    i18nKey: "top_project_leader",
    imageUrl: "/assets/awards/images/top-project-leader.png",
    order: 3,
    quantity: 3,
    unit: "individual",
    value: 7_000_000,
    valueMode: "per_award",
  },
  {
    slug: "best-manager",
    i18nKey: "best_manager",
    imageUrl: "/assets/awards/images/best-manager.png",
    order: 4,
    quantity: 1,
    unit: "individual",
    value: 10_000_000,
    valueMode: "per_award",
  },
  {
    slug: "signature-2025-creator",
    i18nKey: "signature_2025_creator",
    imageUrl: "/assets/awards/images/signature-2025-creator.png",
    order: 5,
    quantity: 1,
    unit: "individual_or_team",
    value: { individual: 5_000_000, team: 8_000_000 },
    valueMode: "per_individual_or_team",
  },
  {
    slug: "mvp",
    i18nKey: "mvp",
    imageUrl: "/assets/awards/images/mvp.png",
    order: 6,
    quantity: 1,
    unit: "individual",
    value: 15_000_000,
    valueMode: "per_award",
  },
];

const DETAILS_BY_SLUG: ReadonlyMap<AwardSlug, AwardCategoryDetail> = new Map(
  AWARDS_DETAILS.map((d) => [d.slug, d])
);

export function getAwardDetail(slug: AwardSlug): AwardCategoryDetail {
  const detail = DETAILS_BY_SLUG.get(slug);
  if (!detail) {
    throw new Error(`Unknown award slug: ${slug}`);
  }
  return detail;
}

export function getAwardDetails(): ReadonlyArray<AwardCategoryDetail> {
  return AWARDS_DETAILS;
}
