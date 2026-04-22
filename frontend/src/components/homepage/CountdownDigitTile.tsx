type Size = "default" | "large";

type Props = {
  char: string;
  size?: Size;
};

type TileTokens = {
  width: string;
  height: string;
  borderWidth: string;
  borderRadius: string;
  blur: string;
  fontSize: string;
};

const TOKENS: Record<Size, TileTokens> = {
  default: {
    width: "51.2px",
    height: "81.92px",
    borderWidth: "0.5px",
    borderRadius: "8px",
    blur: "16.64px",
    fontSize: "49.152px",
  },
  large: {
    width: "77px",
    height: "123px",
    borderWidth: "0.75px",
    borderRadius: "12px",
    blur: "24.96px",
    fontSize: "73.728px",
  },
};

export default function CountdownDigitTile({ char, size = "default" }: Props) {
  const t = TOKENS[size];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: t.width,
        height: t.height,
        borderRadius: t.borderRadius,
        border: `${t.borderWidth} solid var(--color-border-gold)`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)",
          opacity: 0.5,
          backdropFilter: `blur(${t.blur})`,
          WebkitBackdropFilter: `blur(${t.blur})`,
          zIndex: 0,
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-digital-numbers)",
          fontSize: t.fontSize,
          fontWeight: 400,
          color: "var(--color-text-white)",
          lineHeight: 1,
        }}
      >
        {char}
      </span>
    </div>
  );
}
