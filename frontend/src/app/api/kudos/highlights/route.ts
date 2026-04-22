import { NextResponse } from "next/server";
import { requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.context.supabase.rpc("get_kudos_highlights_7d");
  if (error) return rpcError(500, error);

  return NextResponse.json(data ?? []);
}
