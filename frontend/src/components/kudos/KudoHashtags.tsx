type Props = {
  hashtags: ReadonlyArray<string>;
  /** Show only first N tags; excess truncated with ellipsis. */
  maxVisible?: number;
};

export default function KudoHashtags({ hashtags, maxVisible }: Props) {
  if (hashtags.length === 0) return null;

  const visible = maxVisible === undefined ? hashtags : hashtags.slice(0, maxVisible);
  const truncated = maxVisible !== undefined && hashtags.length > maxVisible;

  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.15px",
        color: "var(--color-text-tag-red, #D4271D)",
      }}
    >
      {visible.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
      {truncated && <li aria-hidden="true">…</li>}
    </ul>
  );
}
