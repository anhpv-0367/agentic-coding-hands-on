import { getTranslations } from "next-intl/server";
import SectionHeader from "@/components/ui/SectionHeader";

export default async function AwardsHeader() {
  const t = await getTranslations("homepage.awards");

  return (
    <SectionHeader
      caption={t("caption")}
      title={t("title")}
      description={t("description")}
    />
  );
}
