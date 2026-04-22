import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import type { KudoTier } from "@/types/kudos";

type Props = {
  tier: KudoTier;
  size?: "sm" | "md";
};

const TIER_STYLES: Record<KudoTier, {
  background: string;
  border: string;
  color: string;
}> = {
  new: {
    background: "transparent",
    border: "0.5px solid #999999",
    color: "#999999",
  },
  rising: {
    background: "transparent",
    border: "0.5px solid transparent",
    color: "#FFFFFF",
  },
  super: {
    background: "transparent",
    border: "0.5px solid #FFEA9E",
    color: "#FFEA9E",
  },
  legend: {
    background: "rgba(255, 234, 158, 0.1)",
    border: "0.5px solid #FFEA9E",
    color: "#FFEA9E",
  },
};

export default function TierBadge({ tier, size = "sm" }: Props) {
  const t = useTranslations("kudos.user.tier");
  const styles = TIER_STYLES[tier];
  const iconSize = size === "sm" ? 12 : 16;

  return (
    <span
      data-tier={tier}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 100,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: size === "sm" ? 10.9 : 12,
        fontWeight: 500,
        lineHeight: "16.4px",
        letterSpacing: "0.1px",
        background: styles.background,
        border: styles.border,
        color: styles.color,
      }}
    >
      <Icon
        src={`/assets/kudos/tier-${tier}.png`}
        size={iconSize}
        alt=""
        aria-hidden="true"
        kind="raster"
      />
      {t(tier)}
    </span>
  );
}
