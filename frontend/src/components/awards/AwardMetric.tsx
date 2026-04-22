import Icon from "@/components/ui/Icon";

type IconKind = "diamond" | "license";

type Props = {
  icon: IconKind;
  label: string;
  value: string;
  /** Unit (e.g. "Cá nhân") stacked below the value. Used by the quantity row. */
  unit?: string;
  /** Suffix (e.g. "cho mỗi giải thưởng") stacked below the value. Used by the value row. */
  suffix?: string;
};

const ICON_SRC: Record<IconKind, string> = {
  diamond: "/assets/icons/diamond.svg",
  license: "/assets/icons/license.svg",
};

export default function AwardMetric({
  icon,
  label,
  value,
  unit,
  suffix,
}: Props) {
  const trailing = unit ?? suffix;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "8px",
        width: "100%",
      }}
    >
      <Icon
        src={ICON_SRC[icon]}
        size={24}
        alt=""
        aria-hidden="true"
        style={{ marginTop: "4px" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          color: "var(--color-text-white)",
          letterSpacing: "0.15px",
          flex: 1,
          minWidth: 0,
        }}
      >
        <span>{label}</span>
        <div
          style={{
            fontSize: "var(--text-award-value-size, 36px)",
            lineHeight: "var(--text-award-value-line-height, 44px)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span style={{ fontWeight: 700 }}>{value}</span>
          {trailing && (
            <span
              style={{
                fontSize: "var(--text-award-value-size, 36px)",
                lineHeight: "var(--text-award-value-line-height, 44px)",
                fontWeight: 700,
              }}
            >
              {trailing}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
