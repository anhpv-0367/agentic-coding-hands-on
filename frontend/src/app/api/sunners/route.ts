import { NextResponse, type NextRequest } from "next/server";
import { SunnerSearchSchema } from "@/lib/services/kudos-validation";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = SunnerSearchSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) return errorResponse(400, "invalid_query", parsed.error.message);

  const { data, error } = await auth.context.supabase.rpc("search_sunners", {
    p_query: parsed.data.search,
    p_limit: parsed.data.limit,
  });
  if (error) return rpcError(500, error);

  const me = auth.context.userId;
  const filtered = Array.isArray(data)
    ? data.filter((row: { id?: string }) => row?.id !== me)
    : [];

  return NextResponse.json(filtered);
}
