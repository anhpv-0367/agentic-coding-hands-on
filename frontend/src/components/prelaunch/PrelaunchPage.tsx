import HeroBackdrop from "@/components/homepage/HeroBackdrop";
import Countdown from "@/components/homepage/Countdown";
import PrelaunchTitle from "./PrelaunchTitle";

type Props = {
  eventDateIso: string;
};

export default function PrelaunchPage({ eventDateIso }: Props) {
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
      <HeroBackdrop variant="prelaunch" />
      <main
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "96px 24px",
          minHeight: "100vh",
        }}
      >
        <PrelaunchTitle />
        <Countdown size="large" targetIso={eventDateIso} />
      </main>
    </div>
  );
}
