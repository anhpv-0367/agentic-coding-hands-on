import { NextResponse, type NextRequest } from "next/server";
import {
  CreateKudoSchema,
  KudosListQuerySchema,
} from "@/lib/services/kudos-validation";
import {
  errorResponse,
  requireUser,
  rpcError,
} from "@/lib/services/api-helpers";

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = KudosListQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return errorResponse(400, "invalid_query", parsed.error.message);
  }

  const { data, error } = await auth.context.supabase.rpc(
    "list_kudos_paginated",
    {
      p_cursor: parsed.data.cursor ?? null,
      p_limit: parsed.data.limit,
      p_hashtag: parsed.data.hashtag ?? null,
      p_department: parsed.data.department ?? null,
    }
  );
  if (error) return rpcError(500, error);

  return NextResponse.json(data ?? { items: [], next_cursor: null });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "invalid_json", "Request body is not valid JSON.");
  }

  const parsed = CreateKudoSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "invalid_body", parsed.error.message);
  }

  const { supabase, userId } = auth.context;

  if (parsed.data.recipient_id === userId) {
    return errorResponse(
      403,
      "self_recipient",
      "Cannot send a Kudo to yourself."
    );
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("kudos")
    .insert({
      sender_id: userId,
      recipient_id: parsed.data.recipient_id,
      title: parsed.data.title,
      message: parsed.data.message,
      hashtags: parsed.data.hashtags,
      is_anonymous: parsed.data.is_anonymous,
    })
    .select()
    .single();

  if (insertErr || !inserted) {
    return rpcError(500, insertErr ?? new Error("Insert failed"));
  }

  const attachmentUrls = parsed.data.attachment_urls ?? [];
  if (attachmentUrls.length > 0) {
    const rows = attachmentUrls.map((url, position) => ({
      kudo_id: inserted.id,
      url,
      position,
    }));
    const { error: attErr } = await supabase.from("kudo_attachments").insert(rows);
    if (attErr) return rpcError(500, attErr);
  }

  const { data: detail, error: detailErr } = await supabase.rpc("get_kudo_detail", {
    p_id: inserted.id,
  });
  if (detailErr) return rpcError(500, detailErr);

  return NextResponse.json(detail, { status: 201 });
}
