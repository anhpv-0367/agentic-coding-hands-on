import { NextResponse, type NextRequest } from "next/server";
import { UploadLimits } from "@/lib/services/kudos-validation";
import { errorResponse, requireUser, rpcError } from "@/lib/services/api-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return errorResponse(400, "invalid_form", "Expected multipart/form-data body.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return errorResponse(400, "missing_file", "A 'file' field is required.");
  }

  if (!UploadLimits.allowedMime.has(file.type)) {
    return errorResponse(
      415,
      "unsupported_media_type",
      `Allowed types: ${Array.from(UploadLimits.allowedMime).join(", ")}.`
    );
  }

  if (file.size > UploadLimits.maxBytes) {
    return errorResponse(
      413,
      "payload_too_large",
      `File exceeds ${UploadLimits.maxBytes} bytes.`
    );
  }

  const { supabase, userId } = auth.context;
  const ext = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? "";
  const objectPath = `${userId}/${crypto.randomUUID()}${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("kudos-attachments")
    .upload(objectPath, file, { contentType: file.type });
  if (uploadErr) return rpcError(500, uploadErr);

  const {
    data: { publicUrl },
  } = supabase.storage.from("kudos-attachments").getPublicUrl(objectPath);

  return NextResponse.json({ url: publicUrl });
}
