import type { AwardSlug } from "@/types/homepage";

export type { AwardSlug };

export type AwardUnit = "individual" | "team" | "individual_or_team";

export type AwardValueMode =
  | "per_award"
  | "per_individual_or_team";

export type AwardDualValue = {
  individual: number;
  team: number;
};

export type AwardCategoryDetail = {
  slug: AwardSlug;
  i18nKey: string;
  imageUrl: string;
  order: number;
  quantity: number;
  unit: AwardUnit;
  value: number | AwardDualValue;
  valueMode: AwardValueMode;
};
