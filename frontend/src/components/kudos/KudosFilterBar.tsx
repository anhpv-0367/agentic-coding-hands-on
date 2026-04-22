"use client";

import { useTranslations } from "next-intl";
import type { KudosFilterOptions, KudosFilters } from "@/types/kudos";
import FilterDropdown from "./FilterDropdown";

type Props = {
  filters: KudosFilters;
  options: KudosFilterOptions;
  onChange: (next: KudosFilters) => void;
};

export default function KudosFilterBar({ filters, options, onChange }: Props) {
  const t = useTranslations("kudos.filter");

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <FilterDropdown
        label={t("hashtag")}
        allLabel={t("all")}
        value={filters.hashtag ?? null}
        onChange={(next) => onChange({ ...filters, hashtag: next ?? undefined })}
        options={options.hashtags.map((h) => ({ value: h, label: `#${h}` }))}
      />
      <FilterDropdown
        label={t("department")}
        allLabel={t("all")}
        value={filters.department ?? null}
        onChange={(next) => onChange({ ...filters, department: next ?? undefined })}
        options={options.departments.map((d) => ({ value: d, label: d }))}
      />
    </div>
  );
}
