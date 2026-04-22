import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  id?: string;
};

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function VisuallyHidden({ children, as: Tag = "span", id }: Props) {
  return (
    <Tag id={id} style={SR_ONLY_STYLE}>
      {children}
    </Tag>
  );
}
