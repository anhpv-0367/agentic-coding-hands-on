import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";
import type { HeaderNavKey } from "./Header";

type Props = {
  variant?: "minimal" | "full";
  selectedNav?: HeaderNavKey;
};

export default async function Footer({
  variant = "minimal",
  selectedNav = null,
}: Props) {
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  if (variant === "minimal") {
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
            fontFamily: "var(--font-montserrat-alternates), sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            color: "var(--color-text-white)",
            textAlign: "center",
          }}
        >
          {tFooter("copyright")}
        </span>
      </footer>
    );
  }

  return (
    <footer
      className="px-4 py-6 md:px-[90px] md:py-10"
      style={{
        width: "100%",
        borderTop: "1px solid var(--color-footer-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "40px",
        flexWrap: "wrap",
        zIndex: 2,
        position: "relative",
      }}
    >
      <Link
        href="/"
        aria-label={tNav("logo_aria")}
        style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      >
        <Icon
          src="/assets/login/logos/saa-logo.png"
          size={52}
          alt=""
          aria-hidden="true"
          style={{ height: "64px", width: "auto", objectFit: "contain" }}
        />
      </Link>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <FooterLink
          href="/"
          label={tFooter("nav.about_saa")}
          selected={selectedNav === "about-saa"}
        />
        <FooterLink
          href="/awards"
          label={tFooter("nav.awards_info")}
          selected={selectedNav === "awards"}
        />
        <FooterLink
          href="/kudos"
          label={tFooter("nav.sunkudos")}
          selected={selectedNav === "kudos"}
        />
        <FooterLink
          href="#"
          label={tFooter("nav.standards")}
          selected={false}
          disabled
        />
      </nav>

      <span
        style={{
          fontFamily: "var(--font-montserrat-alternates), sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "24px",
          color: "var(--color-text-white)",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {tFooter("copyright")}
      </span>
    </footer>
  );
}

function FooterLink({
  href,
  label,
  selected,
  disabled = false,
}: {
  href: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
}) {
  const baseStyle = {
    padding: "16px",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "24px",
    letterSpacing: "0.15px",
    color: "var(--color-text-white)",
    textDecoration: "none",
    background: "transparent",
    borderRadius: "0",
    display: "inline-flex",
    alignItems: "center",
  } as const;

  if (disabled) {
    return (
      <span
        role="link"
        aria-disabled="true"
        style={{ ...baseStyle, cursor: "default", opacity: 0.8, userSelect: "none" }}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      style={{
        ...baseStyle,
        color: selected ? "var(--color-text-gold)" : "var(--color-text-white)",
        textShadow: selected ? "var(--text-shadow-glow)" : "none",
      }}
    >
      {label}
    </Link>
  );
}
