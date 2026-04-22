import { render, screen, act, waitFor } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import HeartButton from "@/components/kudos/HeartButton";

jest.mock("@/lib/services/kudos-service", () => ({
  addReaction: jest.fn(),
  removeReaction: jest.fn(),
}));

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

import { addReaction, removeReaction } from "@/lib/services/kudos-service";

const mockAdd = addReaction as jest.MockedFunction<typeof addReaction>;
const mockRemove = removeReaction as jest.MockedFunction<typeof removeReaction>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("<HeartButton>", () => {
  it("renders initial count + unliked aria", () => {
    render(<HeartButton kudoId="k-1" initialCount={7} initialLiked={false} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("optimistic like: increments count and flips aria-pressed", async () => {
    mockAdd.mockResolvedValue({ heart_count: 8 });
    render(<HeartButton kudoId="k-1" initialCount={7} initialLiked={false} />);

    const btn = screen.getByRole("button");
    await act(async () => {
      btn.click();
    });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("8")).toBeInTheDocument();
    await waitFor(() => expect(mockAdd).toHaveBeenCalledWith("k-1"));
  });

  it("rolls back on server error", async () => {
    mockAdd.mockRejectedValue(new Error("boom"));
    render(<HeartButton kudoId="k-1" initialCount={3} initialLiked={false} />);
    const btn = screen.getByRole("button");
    await act(async () => {
      btn.click();
    });
    await waitFor(() => expect(btn).toHaveAttribute("aria-pressed", "false"));
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("unlike flow: decrements + calls removeReaction", async () => {
    mockRemove.mockResolvedValue({ heart_count: 5 });
    render(<HeartButton kudoId="k-2" initialCount={6} initialLiked={true} />);
    const btn = screen.getByRole("button");
    await act(async () => {
      btn.click();
    });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("5")).toBeInTheDocument();
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith("k-2"));
  });

  it("debounces rapid clicks within 500ms", async () => {
    mockAdd.mockResolvedValue({ heart_count: 10 });
    render(<HeartButton kudoId="k-3" initialCount={9} initialLiked={false} />);
    const btn = screen.getByRole("button");
    await act(async () => {
      btn.click();
      btn.click();
      btn.click();
    });
    await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1));
  });
});
