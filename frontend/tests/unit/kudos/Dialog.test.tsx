import { render, screen, fireEvent } from "@testing-library/react";
import Dialog from "@/components/ui/Dialog";

describe("<Dialog>", () => {
  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} onClose={() => {}}>
        <p>Body</p>
      </Dialog>
    );
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("renders dialog role when open", () => {
    render(
      <Dialog open={true} onClose={() => {}} ariaLabel="Test dialog">
        <button type="button">Ok</button>
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "Test dialog" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on ESC", () => {
    const onClose = jest.fn();
    render(
      <Dialog open={true} onClose={onClose} ariaLabel="X">
        <button type="button">Ok</button>
      </Dialog>
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click (not on inner click)", () => {
    const onClose = jest.fn();
    render(
      <Dialog open={true} onClose={onClose} ariaLabel="X">
        <button type="button">Ok</button>
      </Dialog>
    );
    // Clicking the dialog itself does NOT close
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking the backdrop (presentation wrapper) closes
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while open", () => {
    const { rerender } = render(
      <Dialog open={true} onClose={() => {}} ariaLabel="X">
        <button type="button">Ok</button>
      </Dialog>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Dialog open={false} onClose={() => {}} ariaLabel="X">
        <button type="button">Ok</button>
      </Dialog>
    );
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
