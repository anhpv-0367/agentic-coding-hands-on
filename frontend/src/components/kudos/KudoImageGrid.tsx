"use client";

import { useState } from "react";
import Lightbox from "@/components/ui/Lightbox";

type Props = {
  images: ReadonlyArray<string>;
  altPrefix?: string;
};

function ImageTile({
  src,
  onClick,
  altText,
}: {
  src: string;
  onClick: () => void;
  altText: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        border: "none",
        padding: 0,
        aspectRatio: "4 / 3",
        cursor: "pointer",
        background: "rgba(0, 16, 26, 0.08)",
      }}
    >
      {failed ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-meta-on-card, #666666)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 12,
          }}
        >
          Đang tải…
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={altText}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </button>
  );
}

export default function KudoImageGrid({
  images,
  altPrefix = "Kudo attachment",
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div
        role="list"
        style={{
          display: "grid",
          gridTemplateColumns:
            images.length === 1 ? "1fr" : "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 8,
          width: "100%",
        }}
      >
        {images.map((src, idx) => (
          <div role="listitem" key={`${src}-${idx}`}>
            <ImageTile
              src={src}
              altText={`${altPrefix} ${idx + 1}`}
              onClick={() => setOpenIndex(idx)}
            />
          </div>
        ))}
      </div>
      <Lightbox
        images={images}
        open={openIndex !== null}
        initialIndex={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        altPrefix={altPrefix}
      />
    </>
  );
}
