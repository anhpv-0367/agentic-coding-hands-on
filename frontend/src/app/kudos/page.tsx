import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import KudosPage from "@/components/kudos/KudosPage";
import type { UserRole } from "@/types/homepage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kudos.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function KudosRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=%2Fkudos");
  }

  const role: UserRole =
    user.app_metadata?.role === "admin" ? "admin" : "user";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return <KudosPage user={{ avatarUrl, role }} />;
}
