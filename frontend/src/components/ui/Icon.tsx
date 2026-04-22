import type { CSSProperties } from "react";
import Image from "next/image";

type IconProps = {
  src: string;
  size: number;
  alt: string;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  kind?: "svg" | "raster";
  priority?: boolean;
  width?: number;
  height?: number;
};

export default function Icon({
  src,
  size,
  alt,
  className,
  style,
  "aria-hidden": ariaHidden,
  kind = "svg",
  priority = false,
  width,
  height,
}: IconProps) {
  const w = width ?? size;
  const h = height ?? size;

  if (kind === "raster") {
    return (
      <Image
        src={src}
        width={w}
        height={h}
        alt={alt}
        aria-hidden={ariaHidden}
        className={className}
        style={{ flexShrink: 0, ...style }}
        priority={priority}
      />
    );
  }

  return (
    <img
      src={src}
      width={w}
      height={h}
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      style={{ width: w, height: h, flexShrink: 0, ...style }}
    />
  );
}
