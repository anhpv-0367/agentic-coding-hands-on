type Props = {
  imageUrl: string;
  alt: string;
};

export default function AwardPicture({ imageUrl, alt }: Props) {
  return (
    <div
      style={{
        position: "relative",
        width: "336px",
        height: "336px",
        flexShrink: 0,
        borderRadius: "24px",
        border: "0.955px solid var(--color-border-gold)",
        boxShadow:
          "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 var(--color-accent-glow)",
        overflow: "hidden",
        aspectRatio: "1 / 1",
        maxWidth: "100%",
      }}
    >
      {}
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={336}
        height={336}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "24px",
          mixBlendMode: "screen",
          display: "block",
        }}
      />
    </div>
  );
}
