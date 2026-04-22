import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale } from "./src/i18n/config";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/prelaunch"];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prelaunch mode short-circuit — runs BEFORE Supabase to avoid unnecessary auth calls.
  // When NEXT_PUBLIC_PRELAUNCH_MODE is "true", every request except /prelaunch itself,
  // Next.js internals, and public assets is redirected to /prelaunch.
  const prelaunchMode = process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true";
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico";
  if (prelaunchMode && pathname !== "/prelaunch" && !isAsset) {
    return NextResponse.redirect(new URL("/prelaunch", request.url));
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const intlResponse = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isPublicPath && !user) {
    const returnTo = encodeURIComponent(pathname);
    const loginUrl = new URL(`/login?returnTo=${returnTo}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|assets).*)"],
};
