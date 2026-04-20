/**
 * @jest-environment node
 *
 * Integration tests for middleware route protection.
 */
import { NextRequest } from "next/server";

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: jest.fn(() =>
    jest.fn((_req: unknown) => {
      const { NextResponse } = require("next/server");
      return NextResponse.next();
    })
  ),
}));

function makeRequest(path: string) {
  return new NextRequest(new URL(`http://localhost:3000${path}`));
}

describe("middleware route protection", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
  });

  it("redirects unauthenticated GET / to /login?returnTo=%2F", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { middleware } = await import("../../../middleware");
    const response = await middleware(makeRequest("/"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("location")).toContain("returnTo=%2F");
  });

  it("redirects unauthenticated GET /dashboard to /login?returnTo=%2Fdashboard", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { middleware } = await import("../../../middleware");
    const response = await middleware(makeRequest("/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("returnTo=%2Fdashboard");
  });

  it("redirects authenticated GET /login to /", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "uuid-123" } } });
    const { middleware } = await import("../../../middleware");
    const response = await middleware(makeRequest("/login"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("allows unauthenticated access to /login (public path — no redirect)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { middleware } = await import("../../../middleware");
    const response = await middleware(makeRequest("/login"));
    expect(response.status).not.toBe(307);
  });

  it("allows unauthenticated access to /auth/callback (public path)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { middleware } = await import("../../../middleware");
    const response = await middleware(makeRequest("/auth/callback"));
    expect(response.status).not.toBe(307);
  });
});
