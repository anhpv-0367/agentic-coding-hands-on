/**
 * @jest-environment node
 *
 * T050 — upload validation: rejects >5 MB and non-image MIME types.
 */

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { POST as postUpload } from "@/app/api/uploads/route";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function authedSupabase() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/file.jpg" },
        }),
      }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>;
}

function buildRequest(file: File): Request {
  const form = new FormData();
  form.append("file", file);
  return new Request("http://localhost/api/uploads", { method: "POST", body: form });
}

beforeEach(() => jest.resetAllMocks());

describe("POST /api/uploads", () => {
  it("rejects unsupported MIME type with 415", async () => {
    mockCreateClient.mockResolvedValue(authedSupabase());
    const txt = new File(["hello"], "note.txt", { type: "text/plain" });

    const res = await postUpload(buildRequest(txt) as never);
    expect(res.status).toBe(415);
    expect((await res.json()).code).toBe("unsupported_media_type");
  });

  it("rejects oversized files with 413", async () => {
    mockCreateClient.mockResolvedValue(authedSupabase());
    // 6 MB binary
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "huge.png", {
      type: "image/png",
    });

    const res = await postUpload(buildRequest(big) as never);
    expect(res.status).toBe(413);
    expect((await res.json()).code).toBe("payload_too_large");
  });

  it("accepts a small PNG and returns URL", async () => {
    mockCreateClient.mockResolvedValue(authedSupabase());
    const small = new File([new Uint8Array(10)], "ok.png", { type: "image/png" });

    const res = await postUpload(buildRequest(small) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://example.com/file.jpg");
  });
});
