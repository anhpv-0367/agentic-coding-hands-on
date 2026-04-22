import Icon from "@/components/ui/Icon";

type Props = {
  title: string;
};

export default function AwardTitleRow({ title }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Icon
        src="/assets/icons/target.svg"
        size={24}
        alt=""
        aria-hidden="true"
      />
      <h2
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "32px",
          color: "var(--color-text-gold)",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
