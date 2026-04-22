import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

const IdSchema = z.string().uuid();

async function fetchHeartCount(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  kudoId: string
): Promise<number> {
  const { data } = await supabase
    .from("kudos")
    .select("heart_count")
    .eq("id", kudoId)
    .single();
  return (data as { heart_count?: number } | null)?.heart_count ?? 0;
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return errorResponse(400, "invalid_id", "Invalid kudo id.");

  const { supabase, userId } = auth.context;
  const { error } = await supabase
    .from("kudo_reactions")
    .insert({ kudo_id: parsed.data, user_id: userId, type: "heart" });

  // Idempotent on duplicate (unique constraint → 23505).
  if (error && error.code !== "23505") return rpcError(500, error);

  const heart_count = await fetchHeartCount(supabase, parsed.data);
  return NextResponse.json({ heart_count });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return errorResponse(400, "invalid_id", "Invalid kudo id.");

  const { supabase, userId } = auth.context;
  const { error } = await supabase
    .from("kudo_reactions")
    .delete()
    .eq("kudo_id", parsed.data)
    .eq("user_id", userId)
    .eq("type", "heart");
  if (error) return rpcError(500, error);

  const heart_count = await fetchHeartCount(supabase, parsed.data);
  return NextResponse.json({ heart_count });
}
