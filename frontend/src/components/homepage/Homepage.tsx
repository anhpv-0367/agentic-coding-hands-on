import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import HeroBackdrop from "./HeroBackdrop";
import HeroSection from "./HeroSection";
import RootFurtherDisplay from "./RootFurtherDisplay";
import HeroDescription from "./HeroDescription";
import AwardsSection from "./AwardsSection";
import KudosPromo from "./KudosPromo";
import WidgetButton from "./WidgetButton";
import type { UserRole } from "@/types/homepage";

type Props = {
  eventDateIso: string;
  user: {
    avatarUrl: string | null;
    role: UserRole;
  };
};

export default function Homepage({ eventDateIso, user }: Props) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SkipLink />
      <HeroBackdrop />
      <Header variant="full" selectedNav="about-saa" user={user} />
      <main
        id="main-content"
        className="px-6 md:px-12 lg:px-36"
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          paddingTop: "calc(80px + 96px)",
          paddingBottom: "96px",
          display: "flex",
          flexDirection: "column",
          gap: "120px",
        }}
      >
        <HeroSection eventDateIso={eventDateIso} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            maxWidth: "900px",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <RootFurtherDisplay />
          <HeroDescription />
        </div>
        <AwardsSection />
        <KudosPromo />
      </main>
      <WidgetButton />
      <Footer variant="full" selectedNav="about-saa" />
    </div>
  );
}
