import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";
import Countdown from "./Countdown";
import EventInfo from "./EventInfo";
import CtaButton from "./CtaButton";

type Props = {
  eventDateIso: string;
};

export default async function HeroSection({ eventDateIso }: Props) {
  const t = await getTranslations("homepage.hero");

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        maxWidth: "680px",
      }}
    >
      <Icon
        src="/assets/homepage/images/root-further-hero-logo.png"
        size={240}
        width={240}
        height={120}
        alt={t("root_further_alt")}
        kind="raster"
        priority
      />
      <Countdown targetIso={eventDateIso} />
      <EventInfo />
      <div
        className="flex flex-col sm:flex-row"
        style={{ gap: "40px", flexWrap: "wrap" }}
      >
        <CtaButton
          href="/awards"
          label={t("cta_about_awards")}
          variant="primary"
        />
        <CtaButton
          href="/kudos"
          label={t("cta_about_kudos")}
          variant="outline"
        />
      </div>
    </section>
  );
}
