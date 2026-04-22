import type { AwardCategory } from "@/types/homepage";

export const AWARD_CATEGORIES: ReadonlyArray<AwardCategory> = [
  {
    slug: "top-talent",
    i18nKey: "top_talent",
    imageUrl: "/assets/homepage/images/awards/top-talent.png",
    order: 1,
  },
  {
    slug: "top-project",
    i18nKey: "top_project",
    imageUrl: "/assets/homepage/images/awards/top-project.png",
    order: 2,
  },
  {
    slug: "top-project-leader",
    i18nKey: "top_project_leader",
    imageUrl: "/assets/homepage/images/awards/top-project-leader.png",
    order: 3,
  },
  {
    slug: "best-manager",
    i18nKey: "best_manager",
    imageUrl: "/assets/homepage/images/awards/best-manager.png",
    order: 4,
  },
  {
    slug: "signature-2025-creator",
    i18nKey: "signature_2025_creator",
    imageUrl: "/assets/homepage/images/awards/signature-2025-creator.png",
    order: 5,
  },
  {
    slug: "mvp",
    i18nKey: "mvp",
    imageUrl: "/assets/homepage/images/awards/mvp.png",
    order: 6,
  },
];

export function getAwardCategories(): ReadonlyArray<AwardCategory> {
  return AWARD_CATEGORIES;
}
