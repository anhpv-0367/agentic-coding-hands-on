export default function Footer() {
  return (
    <footer
      className="px-4 py-6 md:px-[90px] md:py-10"
      style={{
        width: "100%",
        borderTop: "1px solid var(--color-footer-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-montserrat-alternates)",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          color: "var(--color-text-white)",
          textAlign: "center",
        }}
      >
        Bản quyền thuộc về Sun* © 2025
      </span>
    </footer>
  );
}
