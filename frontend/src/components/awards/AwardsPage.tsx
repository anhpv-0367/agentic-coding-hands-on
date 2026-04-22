import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import SectionHeader from "@/components/ui/SectionHeader";
import { getAwardDetails } from "@/lib/data/awards-details";
import type { UserRole } from "@/types/homepage";
import AwardInfoCard from "./AwardInfoCard";
import AwardsMainClient from "./AwardsMainClient";

type Props = {
  user: {
    avatarUrl: string | null;
    role: UserRole;
  };
};

export default async function AwardsPage({ user }: Props) {
  const tPage = await getTranslations("awards.page");
  const tSidebar = await getTranslations("awards.sidebar");
  const tHomepageCategories = await getTranslations("homepage.awards.categories");
  const details = getAwardDetails();

  const sidebarItems = details.map((detail) => ({
    slug: detail.slug,
    label: tHomepageCategories(`${detail.i18nKey}.title`),
  }));

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflowX: "clip",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SkipLink />
      <Header variant="full" selectedNav="awards" user={user} />

      <main
        id="main-content"
        className="px-5 md:px-12 lg:px-36"
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          paddingTop: "calc(80px + 96px)",
          paddingBottom: "96px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-awards-section-gap, 120px)",
        }}
      >
        <SectionHeader title={tPage("title")} headingLevel="h1" />

        <AwardsMainClient
          sidebarItems={sidebarItems}
          sidebarAriaLabel={tSidebar("aria_label")}
        >
          {details.map((detail, index) => (
            <AwardInfoCard key={detail.slug} slug={detail.slug} index={index} />
          ))}
        </AwardsMainClient>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
