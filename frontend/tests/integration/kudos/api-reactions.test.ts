/**
 * @jest-environment node
 *
 * T049 — duplicate heart reaction is idempotent (Postgres unique-constraint 23505
 * is swallowed; the response returns the current heart_count).
 */

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { POST as postReaction } from "@/app/api/kudos/[id]/reactions/route";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

const VALID_ID = "7a5dfbd0-8e14-4ef2-9a3a-0f0a3e1b2c4d";

function buildSupabase(opts: {
  insertError?: { code: string } | null;
  heartCount?: number;
}) {
  const insert = jest.fn().mockResolvedValue({ error: opts.insertError ?? null });
  const single = jest.fn().mockResolvedValue({
    data: { heart_count: opts.heartCount ?? 0 },
    error: null,
  });
  const eq = jest.fn().mockReturnThis();
  const select = jest.fn().mockReturnValue({ eq, single });
  const from = jest.fn().mockImplementation((_table: string) => ({
    insert,
    select,
    eq,
    single,
  }));
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
    from,
    insert,
  } as unknown as Awaited<ReturnType<typeof createClient>>;
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => jest.resetAllMocks());

describe("POST /api/kudos/[id]/reactions", () => {
  it("idempotent on duplicate (error code 23505 swallowed)", async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabase({ insertError: { code: "23505" }, heartCount: 42 })
    );

    const res = await postReaction(new Request("http://x"), ctx(VALID_ID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.heart_count).toBe(42);
  });

  it("returns 500 on unexpected db error", async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabase({ insertError: { code: "XX000" }, heartCount: 0 })
    );

    const res = await postReaction(new Request("http://x"), ctx(VALID_ID));
    expect(res.status).toBe(500);
  });

  it("rejects invalid id with 400", async () => {
    mockCreateClient.mockResolvedValue(buildSupabase({ heartCount: 0 }));
    const res = await postReaction(new Request("http://x"), ctx("not-a-uuid"));
    expect(res.status).toBe(400);
  });
});
