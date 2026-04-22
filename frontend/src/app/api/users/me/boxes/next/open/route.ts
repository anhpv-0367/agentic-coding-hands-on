import { NextResponse } from "next/server";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

export async function POST() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.context.supabase.rpc("open_next_box");
  if (error) {
    if (error.code === "P0002") {
      return errorResponse(409, "no_unopened_boxes", "There are no unopened boxes.");
    }
    return rpcError(500, error);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return errorResponse(409, "no_unopened_boxes", "There are no unopened boxes.");
  }

  const payload = row as {
    id: string;
    reward_kind: string;
    reward_payload: Record<string, unknown>;
  };

  const { reward_payload, ...rest } = payload;
  const amount =
    typeof reward_payload?.amount === "number"
      ? (reward_payload.amount as number)
      : undefined;

  return NextResponse.json({
    id: rest.id,
    kind: rest.reward_kind,
    label: rest.reward_kind,
    ...(amount !== undefined ? { value: amount } : {}),
    image_url: null,
  });
}
