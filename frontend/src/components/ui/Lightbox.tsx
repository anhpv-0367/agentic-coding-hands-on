"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Dialog from "./Dialog";

type Props = {
  images: ReadonlyArray<string>;
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
  altPrefix?: string;
};

/**
 * Full-screen image viewer. Uses `<Dialog>` for focus-trap + ESC + body-scroll-lock;
 * adds left/right arrow keys to cycle images.
 */
export default function Lightbox({
  images,
  open,
  initialIndex = 0,
  onClose,
  altPrefix = "Kudo attachment",
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  if (!open || images.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setIndex((i) => (i - 1 + images.length) % images.length);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setIndex((i) => (i + 1) % images.length);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} ariaLabel={`${altPrefix} ${index + 1} / ${images.length}`}>
      <div
        onKeyDown={onKeyDown}
        data-testid="kudos-lightbox"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        {images.length > 1 && (
          <button
            ref={firstButtonRef}
            type="button"
            aria-label="Previous image"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            style={buttonStyle}
          >
            ‹
          </button>
        )}
        {}
        <img
          src={images[index]}
          alt={`${altPrefix} ${index + 1}`}
          style={{
            maxWidth: "80vw",
            maxHeight: "80vh",
            objectFit: "contain",
            display: "block",
            borderRadius: 8,
          }}
        />
        {images.length > 1 && (
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            style={buttonStyle}
          >
            ›
          </button>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{ ...buttonStyle, position: "absolute", top: 16, right: 16 }}
        >
          ×
        </button>
      </div>
    </Dialog>
  );
}

const buttonStyle = {
  background: "rgba(0, 0, 0, 0.5)",
  color: "#ffffff",
  border: "none",
  width: 48,
  height: 48,
  borderRadius: 24,
  fontSize: 24,
  cursor: "pointer",
} as const;
