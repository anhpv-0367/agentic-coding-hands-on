type Props = {
  caption?: string;
  title: string;
  description?: string;
  headingLevel?: "h1" | "h2";
};

export default function SectionHeader({
  caption,
  title,
  description,
  headingLevel = "h2",
}: Props) {
  const Heading = headingLevel;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {caption && (
        <span
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "var(--color-text-white)",
            paddingBottom: "16px",
          }}
        >
          {caption}
        </span>
      )}
      {caption && (
        <div
          aria-hidden="true"
          style={{
            width: "100%",
            height: "1px",
            background: "var(--color-divider)",
            marginBottom: "24px",
          }}
        />
      )}
      <Heading
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "57px",
          fontWeight: 700,
          lineHeight: "64px",
          letterSpacing: "-0.25px",
          color: "var(--color-text-gold)",
          margin: 0,
        }}
      >
        {title}
      </Heading>
      {description && (
        <p
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "var(--color-text-white)",
            margin: 0,
            marginTop: "16px",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
