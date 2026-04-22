import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RouteContext = {
  supabase: SupabaseClient;
  userId: string;
};

export async function requireUser(): Promise<
  | { ok: true; context: RouteContext }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { code: "unauthenticated", message: "Please sign in to continue." },
        { status: 401 }
      ),
    };
  }
  return { ok: true, context: { supabase, userId: user.id } };
}

export function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ code, message }, { status });
}

export function rpcError(status: number, err: unknown) {
  let message: string;
  if (err instanceof Error) {
    message = err.message;
  } else if (err && typeof err === "object") {
    // Supabase errors expose message/details/hint/code but are plain objects.
    const e = err as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    message =
      [e.message, e.details, e.hint, e.code ? `(${e.code})` : undefined]
        .filter(Boolean)
        .join(" — ") || JSON.stringify(err);
  } else {
    message = String(err);
  }
  return errorResponse(status, "rpc_error", message);
}
