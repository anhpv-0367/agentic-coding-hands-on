import { NextResponse } from "next/server";
import { requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.context.supabase.rpc("get_my_stats");
  if (error) return rpcError(500, error);

  return NextResponse.json(
    data ?? {
      received: 0,
      sent: 0,
      hearts: 0,
      boxes_opened: 0,
      boxes_unopened: 0,
      tier: "new",
    }
  );
}
