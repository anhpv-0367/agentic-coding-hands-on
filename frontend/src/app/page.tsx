import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Homepage from "@/components/homepage/Homepage";
import { getEventConfig } from "@/lib/services/event-config";
import type { UserRole } from "@/types/homepage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("homepage.metadata");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role: UserRole =
    user.app_metadata?.role === "admin" ? "admin" : "user";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  const eventConfig = getEventConfig();

  return (
    <Homepage
      eventDateIso={eventConfig.event_datetime}
      user={{ avatarUrl, role }}
    />
  );
}
