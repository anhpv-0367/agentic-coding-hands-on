"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";

type ErrorKey = "auth_failed" | "service_unavailable" | null;

type LoginButtonProps = {
  error: ErrorKey;
};

export default function LoginButton({ error }: LoginButtonProps) {
  const t = useTranslations("login");
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (error && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [error]);

  async function handleLogin() {
    setIsLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (oauthError) {
      setIsLoading(false);
    }
  }

  const errorMessage = error
    ? t(`errors.${error}`, { defaultValue: t("errors.auth_failed") })
    : null;

  return (
    <div>
      <button
        ref={buttonRef}
        aria-label={t("aria.login_button")}
        onClick={handleLogin}
        disabled={isLoading}
        style={{
          width: "100%",
          height: "60px",
          padding: "16px 24px",
          backgroundColor: "var(--color-btn-login-bg)",
          color: "var(--color-text-on-btn)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          transition: "background-color 150ms ease-in-out, opacity 200ms ease-in-out",
          fontFamily: "var(--font-montserrat)",
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: "28px",
        }}
        onMouseEnter={(e) => {
          if (!isLoading)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--color-btn-login-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--color-btn-login-bg)";
        }}
      >
        <span>{t("button_label")}</span>
        <Icon
          src="/assets/login/icons/google-logo.svg"
          size={24}
          alt="Google"
        />
      </button>
      {errorMessage && (
        <p
          role="alert"
          style={{
            marginTop: "8px",
            color: "var(--color-error)",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
