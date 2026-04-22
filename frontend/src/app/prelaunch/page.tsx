import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PrelaunchPage } from "@/components/prelaunch";
import { getEventConfig } from "@/lib/services/event-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("prelaunch.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrelaunchRoute() {
  const eventConfig = getEventConfig();
  return <PrelaunchPage eventDateIso={eventConfig.event_datetime} />;
}
