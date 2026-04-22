import type { Locale } from "@/i18n/config";

const LOCALE_TAG: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};

export function formatVndAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatVnd(
  amount: number,
  locale: Locale,
  currencySuffix: string
): string {
  return `${formatVndAmount(amount, locale)} ${currencySuffix}`;
}
