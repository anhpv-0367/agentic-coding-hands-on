import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import AwardsPage from "@/components/awards/AwardsPage";
import type { UserRole } from "@/types/homepage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("awards.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AwardsRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=%2Fawards");
  }

  const role: UserRole =
    user.app_metadata?.role === "admin" ? "admin" : "user";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return <AwardsPage user={{ avatarUrl, role }} />;
}
