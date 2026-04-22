import { render, screen, act, waitFor } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import CopyLinkButton from "@/components/kudos/CopyLinkButton";
import ToastProvider from "@/components/ui/ToastProvider";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => {
    const path = `${ns}.${key}`.split(".");
    let cur: unknown = viMessages;
    for (const p of path) {
      if (typeof cur !== "object" || cur === null) return `${ns}.${key}`;
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" ? cur : `${ns}.${key}`;
  },
}));

describe("<CopyLinkButton>", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  function renderWithToast(url: string) {
    return render(
      <ToastProvider>
        <CopyLinkButton shareUrl={url} />
      </ToastProvider>
    );
  }

  it("writes the URL to clipboard and shows a success toast", async () => {
    renderWithToast("/kudos/abc-123");
    const btn = screen.getByRole("button", { name: /Sao chép link/i });
    await act(async () => {
      btn.click();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const [[written]] = (navigator.clipboard.writeText as jest.Mock).mock.calls;
    expect(written).toContain("/kudos/abc-123");
    await waitFor(() =>
      expect(screen.getByText("Link copied — ready to share!")).toBeInTheDocument()
    );
  });

  it("shows error toast when clipboard rejects and execCommand also fails", async () => {
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error("denied"));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: jest.fn().mockReturnValue(false),
    });
    renderWithToast("/kudos/xyz");
    await act(async () => {
      screen.getByRole("button").click();
    });
    await waitFor(() =>
      expect(screen.getByText(/Không thể sao chép/)).toBeInTheDocument()
    );
  });
});
