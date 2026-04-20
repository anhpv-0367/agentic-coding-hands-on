import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  weight: ["700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "SAA 2025 — ROOT FURTHER",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${montserrat.variable} ${montserratAlternates.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
