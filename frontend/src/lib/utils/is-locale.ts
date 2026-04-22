import type { Locale } from "@/i18n/config";

export function isLocale(value: string | undefined): value is Locale {
  return value === "vi" || value === "en";
}
