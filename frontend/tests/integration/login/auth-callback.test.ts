/**
 * @jest-environment node
 *
 * Integration tests for /auth/callback route handler.
 * These tests verify the OAuth code exchange and redirect logic.
 *
 * Note: Next.js Route Handlers are tested via the handler function directly.
 */
import { GET } from "@/app/auth/callback/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/auth/callback");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /auth/callback", () => {
  let mockExchangeCodeForSession: jest.Mock;

  beforeEach(() => {
    mockExchangeCodeForSession = jest.fn();
    const { createClient } = require("@/lib/supabase/server");
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    });
  });

  it("exchanges code and redirects to / when no returnTo", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(makeRequest({ code: "valid-code" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("exchanges code and redirects to returnTo when valid same-origin path", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(makeRequest({ code: "valid-code", returnTo: "/dashboard" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to / when returnTo is an external URL (open redirect prevention)", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(makeRequest({ code: "valid-code", returnTo: "https://evil.com" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to / when returnTo starts with // (protocol-relative URL)", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(makeRequest({ code: "valid-code", returnTo: "//evil.com" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to /login?error=auth_failed when no code in params", async () => {
    const response = await GET(makeRequest({}));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("location")).toContain("error=auth_failed");
  });

  it("redirects to /login?error=auth_failed when session exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: "invalid code" } });
    const response = await GET(makeRequest({ code: "bad-code" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("error=auth_failed");
  });

  it("redirects to /login?error=auth_failed when error param is present (OAuth cancelled)", async () => {
    const response = await GET(makeRequest({ error: "access_denied" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("error=auth_failed");
  });
});
