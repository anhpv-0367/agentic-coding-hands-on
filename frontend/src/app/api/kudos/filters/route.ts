import { NextResponse } from "next/server";
import { requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.context.supabase.rpc(
    "get_distinct_hashtags_and_departments"
  );
  if (error) return rpcError(500, error);

  return NextResponse.json(data ?? { hashtags: [], departments: [] });
}
