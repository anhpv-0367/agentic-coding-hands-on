type Variant = "homepage" | "prelaunch" | "awards";

type Props = {
  variant?: Variant;
};

type VariantTokens = {
  imageHeight: string;
  gradientHeight: string;
  gradient: string;
};

const VARIANT_TOKENS: Record<Variant, VariantTokens> = {
  homepage: {
    imageHeight: "1392px",
    gradientHeight: "1480px",
    gradient:
      "linear-gradient(12deg, #00101A 23.7%, rgba(0,18,29,0.46) 38.34%, rgba(0,19,32,0) 48.92%)",
  },
  prelaunch: {
    imageHeight: "100vh",
    gradientHeight: "100vh",
    gradient:
      "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)",
  },
  awards: {
    imageHeight: "547px",
    gradientHeight: "0px",
    gradient: "transparent",
  },
};

export default function HeroBackdrop({ variant = "homepage" }: Props) {
  const v = VARIANT_TOKENS[variant];

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: v.imageHeight,
          zIndex: 1,
          backgroundImage: "url('/assets/homepage/images/keyvisual-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
      />
      {v.gradientHeight !== "0px" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: v.gradientHeight,
            zIndex: 1,
            background: v.gradient,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
