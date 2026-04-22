import { renderHook, act, waitFor } from "@testing-library/react";
import { usePolling } from "@/hooks/usePolling";

describe("usePolling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("fires the fetcher at mount and every interval", async () => {
    const fetcher = jest.fn().mockResolvedValue({ total: 42 });
    renderHook(() =>
      usePolling(fetcher, { intervalMs: 1000, pauseWhenHidden: false })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("pauses after maxFailures consecutive errors", async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      usePolling(fetcher, {
        intervalMs: 1000,
        maxFailures: 2,
        pauseWhenHidden: false,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.errorCount).toBeGreaterThanOrEqual(1));

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.paused).toBe(true));
  });

  it("resume() clears paused state and error count", async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      usePolling(fetcher, {
        intervalMs: 1000,
        maxFailures: 1,
        pauseWhenHidden: false,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.paused).toBe(true));

    act(() => result.current.resume());
    expect(result.current.paused).toBe(false);
    expect(result.current.errorCount).toBe(0);
  });
});
