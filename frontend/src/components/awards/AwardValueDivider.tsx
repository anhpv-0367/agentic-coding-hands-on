type Props = {
  label: string;
};

export default function AwardValueDivider({ label }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.15px",
        color: "var(--color-text-white)",
      }}
    >
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "var(--border-awards-divider-gold-alpha)",
        }}
      />
      <span>{label}</span>
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "var(--border-awards-divider-gold-alpha)",
        }}
      />
    </div>
  );
}
