import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

const IdSchema = z.string().uuid();

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) {
    return errorResponse(400, "invalid_id", "Kudo id must be a UUID.");
  }

  const { data, error } = await auth.context.supabase.rpc("get_kudo_detail", {
    p_id: parsed.data,
  });
  if (error) return rpcError(500, error);
  if (!data) {
    return errorResponse(404, "not_found", "Kudo not found.");
  }

  return NextResponse.json(data);
}
