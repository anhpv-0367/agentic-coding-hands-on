import { NextResponse, type NextRequest } from "next/server";
import { DraftPayloadSchema } from "@/lib/services/kudos-validation";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { supabase, userId } = auth.context;
  const { data, error } = await supabase
    .from("kudo_drafts")
    .select("payload, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return rpcError(500, error);

  return NextResponse.json(data ?? null);
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body is not valid JSON.");
  }

  const wrapped = (body && typeof body === "object" && "payload" in body
    ? (body as { payload: unknown }).payload
    : body) as unknown;

  const parsed = DraftPayloadSchema.safeParse(wrapped);
  if (!parsed.success) {
    return errorResponse(400, "invalid_body", parsed.error.message);
  }

  const { supabase, userId } = auth.context;
  const { data, error } = await supabase
    .from("kudo_drafts")
    .upsert({ user_id: userId, payload: parsed.data })
    .select("payload, updated_at")
    .single();
  if (error || !data) return rpcError(500, error ?? new Error("Upsert failed"));

  return NextResponse.json(data);
}

export async function DELETE() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { supabase, userId } = auth.context;
  const { error } = await supabase.from("kudo_drafts").delete().eq("user_id", userId);
  if (error) return rpcError(500, error);

  return new NextResponse(null, { status: 204 });
}
