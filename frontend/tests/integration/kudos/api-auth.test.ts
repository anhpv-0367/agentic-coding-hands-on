/**
 * @jest-environment node
 *
 * T048 — unauthenticated requests to Kudos Route Handlers return 401.
 * Route Handlers are server code; run under the `node` Jest env so Request/Response
 * globals are available.
 */

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { GET as getHighlights } from "@/app/api/kudos/highlights/route";
import { GET as getStats } from "@/app/api/kudos/stats/me/route";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

beforeEach(() => {
  jest.resetAllMocks();
  mockCreateClient.mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    rpc: jest.fn(),
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});

describe("API auth guard", () => {
  it("GET /api/kudos/highlights → 401 when unauthenticated", async () => {
    const res = await getHighlights();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("unauthenticated");
  });

  it("GET /api/kudos/stats/me → 401 when unauthenticated", async () => {
    const res = await getStats();
    expect(res.status).toBe(401);
  });
});
