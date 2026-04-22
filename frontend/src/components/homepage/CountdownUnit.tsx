import CountdownDigitTile from "./CountdownDigitTile";
import { zeroPad2 } from "@/lib/utils/countdown";

type Size = "default" | "large";

type Props = {
  value: number;
  label: string;
  size?: Size;
};

type UnitTokens = {
  digitRowGap: string;
  stackGap: string;
  labelFontSize: string;
  labelLineHeight: string;
};

const TOKENS: Record<Size, UnitTokens> = {
  default: {
    digitRowGap: "4px",
    stackGap: "14px",
    labelFontSize: "24px",
    labelLineHeight: "32px",
  },
  large: {
    digitRowGap: "21px",
    stackGap: "21px",
    labelFontSize: "36px",
    labelLineHeight: "48px",
  },
};

export default function CountdownUnit({ value, label, size = "default" }: Props) {
  const [d1, d2] = zeroPad2(value).split("");
  const t = TOKENS[size];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: t.stackGap,
      }}
    >
      <div style={{ display: "flex", gap: t.digitRowGap }}>
        <CountdownDigitTile char={d1} size={size} />
        <CountdownDigitTile char={d2} size={size} />
      </div>
      <span
        style={{
          fontFamily: "var(--font-montserrat)",
          fontSize: t.labelFontSize,
          fontWeight: 700,
          lineHeight: t.labelLineHeight,
          color: "var(--color-text-white)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
