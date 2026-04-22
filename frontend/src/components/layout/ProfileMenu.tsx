"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/homepage";

type Props = {
  avatarUrl: string | null;
  role: UserRole;
};

export default function ProfileMenu({ avatarUrl, role }: Props) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={tNav("profile_aria")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: "40px",
          height: "40px",
          padding: "4px",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "4px",
          background: isOpen ? "var(--color-gold-hover-bg)" : "transparent",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "background-color 150ms ease-out, border-color 150ms ease-out",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Icon
            src="/assets/homepage/icons/user.svg"
            size={24}
            alt=""
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: "200px",
            background: "var(--color-dropdown-bg)",
            borderRadius: "4px",
            padding: "4px 0",
            zIndex: 60,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setIsOpen(false)}
            style={menuItemStyle}
          >
            {tCommon("profile")}
          </Link>
          {role === "admin" && (
            <Link
              role="menuitem"
              href="/admin"
              onClick={() => setIsOpen(false)}
              style={menuItemStyle}
            >
              {tCommon("admin_dashboard")}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            style={{
              ...menuItemStyle,
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {tCommon("sign_out")}
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  display: "block",
  padding: "12px 16px",
  color: "var(--color-text-white)",
  fontFamily: "var(--font-montserrat)",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textDecoration: "none",
  background: "transparent",
} as const;
