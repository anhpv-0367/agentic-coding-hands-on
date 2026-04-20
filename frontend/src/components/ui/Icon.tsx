import type { CSSProperties } from "react";

type IconProps = {
  src: string;
  size: number;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

export default function Icon({ src, size, alt, className, style }: IconProps) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={className}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
