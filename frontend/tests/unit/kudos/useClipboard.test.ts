import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "@/hooks/useClipboard";

describe("useClipboard", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("returns idle initially", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("writes via modern API and flips status to success", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const ok = await result.current.copy("hello");
      expect(ok).toBe(true);
    });
    expect(result.current.status).toBe("success");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when modern API rejects", async () => {
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error("permission denied")
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: jest.fn().mockReturnValue(true),
    });
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const ok = await result.current.copy("x");
      expect(ok).toBe(true);
    });
    expect(result.current.status).toBe("success");
  });

  it("reports error when both paths fail", async () => {
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error("denied")
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: jest.fn().mockReturnValue(false),
    });
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const ok = await result.current.copy("x");
      expect(ok).toBe(false);
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).not.toBeNull();
  });
});
