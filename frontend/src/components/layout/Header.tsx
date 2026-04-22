import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";
import LanguageSelector from "./LanguageSelector";
import NavLink from "./NavLink";
import NotificationButton from "./NotificationButton";
import ProfileMenu from "./ProfileMenu";
import { getNotificationsSummary } from "@/lib/services/notifications";
import type { UserRole } from "@/types/homepage";

export type HeaderNavKey = "about-saa" | "awards" | "kudos" | "standards" | null;

type Props = {
  variant?: "minimal" | "full";
  selectedNav?: HeaderNavKey;
  user?: {
    avatarUrl: string | null;
    role: UserRole;
  };
};

export default async function Header({
  variant = "minimal",
  selectedNav = null,
  user,
}: Props) {
  const tNav = await getTranslations("nav");
  const notifications = getNotificationsSummary();

  return (
    <header
      className="px-4 md:px-12 lg:px-36"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "80px",
        backgroundColor: "var(--color-bg-header)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "12px",
        paddingBottom: "12px",
      }}
    >
      <Link
        href="/"
        aria-label={tNav("logo_aria")}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <Icon
          src="/assets/login/logos/saa-logo.png"
          size={52}
          alt=""
          aria-hidden="true"
          style={{ height: "56px", objectFit: "contain" }}
        />
      </Link>

      {variant === "full" && (
        <nav
          aria-label={tNav("logo_aria")}
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <NavLink
            href="/"
            label={tNav("about_saa")}
            state={selectedNav === "about-saa" ? "selected" : "normal"}
          />
          <NavLink
            href="/awards"
            label={tNav("awards_info")}
            state={selectedNav === "awards" ? "selected" : "normal"}
          />
          <NavLink
            href="/kudos"
            label={tNav("sunkudos")}
            state={selectedNav === "kudos" ? "selected" : "normal"}
          />
        </nav>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {variant === "full" && (
          <NotificationButton unreadCount={notifications.unread_count} />
        )}
        <LanguageSelector />
        {variant === "full" && user && (
          <ProfileMenu avatarUrl={user.avatarUrl} role={user.role} />
        )}
      </div>
    </header>
  );
}
