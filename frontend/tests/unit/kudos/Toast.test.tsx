import { render, screen, act } from "@testing-library/react";
import ToastProvider, { useToast } from "@/components/ui/ToastProvider";

function Trigger({ message, duration }: { message: string; duration?: number }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast(message, "success", duration)}>
      fire
    </button>
  );
}

describe("<ToastProvider>", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("queues a toast and exposes it with role=status + aria-live=polite", () => {
    render(
      <ToastProvider>
        <Trigger message="Hello" />
      </ToastProvider>
    );
    act(() => {
      screen.getByText("fire").click();
    });
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Hello");
  });

  it("auto-dismisses after the configured duration", () => {
    render(
      <ToastProvider defaultDurationMs={2500}>
        <Trigger message="Bye" duration={2500} />
      </ToastProvider>
    );
    act(() => {
      screen.getByText("fire").click();
    });
    expect(screen.getByText("Bye")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(screen.queryByText("Bye")).toBeNull();
  });

  it("shows multiple concurrent toasts", () => {
    render(
      <ToastProvider defaultDurationMs={5000}>
        <Trigger message="First" />
        <Trigger message="Second" />
      </ToastProvider>
    );
    act(() => {
      screen.getAllByText("fire")[0].click();
      screen.getAllByText("fire")[1].click();
    });
    const toasts = screen.getAllByTestId("kudos-toast");
    expect(toasts).toHaveLength(2);
  });
});
