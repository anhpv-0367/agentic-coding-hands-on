import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";
import VisuallyHidden from "@/components/ui/VisuallyHidden";

export default async function RootFurtherDisplay() {
  const tNav = await getTranslations("nav");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <VisuallyHidden as="h1">{tNav("sr_h1")}</VisuallyHidden>
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}
      >
        <Icon
          src="/assets/homepage/images/root-text.png"
          size={0}
          width={756}
          height={268}
          alt=""
          aria-hidden="true"
          kind="raster"
          priority
          style={{
            width: "auto",
            height: "auto",
            maxHeight: "96px",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
        <Icon
          src="/assets/homepage/images/further-text.png"
          size={0}
          width={1160}
          height={268}
          alt=""
          aria-hidden="true"
          kind="raster"
          priority
          style={{
            width: "auto",
            height: "auto",
            maxHeight: "96px",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
