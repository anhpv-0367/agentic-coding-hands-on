import { NextResponse, type NextRequest } from "next/server";
import { LeaderboardQuerySchema } from "@/lib/services/kudos-validation";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = LeaderboardQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) return errorResponse(400, "invalid_query", parsed.error.message);

  const { data, error } = await auth.context.supabase.rpc(
    "get_gift_recipients_leaderboard",
    { p_limit: parsed.data.limit }
  );
  if (error) return rpcError(500, error);

  return NextResponse.json(data ?? []);
}
