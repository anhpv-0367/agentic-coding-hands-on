"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";

type Props = {
  unreadCount: number;
};

export default function NotificationButton({ unreadCount }: Props) {
  const t = useTranslations("nav");
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      aria-label={t("notifications_aria")}
      aria-disabled={hasUnread ? undefined : "true"}
      onClick={(e) => {
        if (!hasUnread) {
          e.preventDefault();
        }
      }}
      style={{
        position: "relative",
        width: "40px",
        height: "40px",
        padding: "10px",
        border: "none",
        borderRadius: "4px",
        background: "transparent",
        cursor: hasUnread ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--color-gold-hover-bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <Icon
        src="/assets/homepage/icons/bell.svg"
        size={24}
        alt=""
        aria-hidden="true"
      />
      {hasUnread && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--color-status-notification)",
          }}
        />
      )}
    </button>
  );
}
