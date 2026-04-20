import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isSameOriginPath(returnTo: string | null): boolean {
  if (!returnTo) return false;
  return returnTo.startsWith("/") && !returnTo.startsWith("//");
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const returnTo = searchParams.get("returnTo");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`, { status: 307 });
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`, { status: 307 });
  }

  const redirectPath = isSameOriginPath(returnTo) ? returnTo! : "/";
  return NextResponse.redirect(`${origin}${redirectPath}`, { status: 307 });
}
