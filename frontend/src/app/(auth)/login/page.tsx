import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginButton from "@/components/auth/LoginButton";
import Icon from "@/components/ui/Icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Sun* Annual Awards 2025",
};

type PageProps = {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
};

type ErrorKey = "auth_failed" | "service_unavailable" | null;

function isValidErrorKey(
  key: string | undefined
): key is "auth_failed" | "service_unavailable" {
  return key === "auth_failed" || key === "service_unavailable";
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const t = await getTranslations("login");
  const errorKey: ErrorKey = isValidErrorKey(params.error) ? params.error : null;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background wave */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/assets/login/images/wave-background.png')",
          backgroundPosition: "-440px -217.975px",
          backgroundSize: "159.763% 133.371%",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Left gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)",
        }}
      />

      {/* Bottom gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)",
        }}
      />

      {/* Header */}
      <Header />

      {/* Main content — padding-top accounts for fixed 80px header */}
      <main
        className="px-6 pb-12 md:px-12 md:pb-24 lg:px-36 lg:pb-24"
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          paddingTop: "calc(80px + 96px)",
          display: "flex",
          flexDirection: "column",
          gap: "80px",
        }}
      >
        {/* ROOT FURTHER brand logo */}
        <div className="w-[280px] md:w-[360px] lg:w-[451px]">
          <Icon
            src="/assets/login/logos/root-further.png"
            size={451}
            alt="ROOT FURTHER"
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Text group: tagline + login button */}
        <div
          style={{
            paddingLeft: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <p
            className="text-base md:text-xl leading-7 md:leading-10 w-full lg:w-[480px]"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: "var(--color-text-white)",
              margin: 0,
            }}
          >
            {t("tagline_line1")}
            <br />
            {t("tagline_line2")}
          </p>

          {/* Button wrapper — full-width on mobile, fixed on desktop */}
          <div className="w-full sm:w-[305px]">
            <LoginButton error={errorKey} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
