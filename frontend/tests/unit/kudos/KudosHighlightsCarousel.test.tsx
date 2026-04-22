import { render, screen, fireEvent } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import KudosHighlightsSection from "@/components/kudos/KudosHighlightsSection";
import ToastProvider from "@/components/ui/ToastProvider";
import type { Kudo } from "@/types/kudos";

jest.mock("@/lib/services/kudos-service", () => ({
  addReaction: jest.fn().mockResolvedValue({ heart_count: 0 }),
  removeReaction: jest.fn().mockResolvedValue({ heart_count: 0 }),
}));

function renderSection(highlights: ReadonlyArray<Kudo>) {
  return render(
    <ToastProvider>
      <KudosHighlightsSection highlights={highlights} />
    </ToastProvider>
  );
}

jest.mock("next-intl", () => ({
  useLocale: () => "vi",
  useTranslations: (ns: string) => (key: string, params?: Record<string, string | number>) => {
    const path = `${ns}.${key}`.split(".");
    let cur: unknown = viMessages;
    for (const p of path) {
      if (typeof cur !== "object" || cur === null) return `${ns}.${key}`;
      cur = (cur as Record<string, unknown>)[p];
    }
    if (typeof cur !== "string") return `${ns}.${key}`;
    if (!params) return cur;
    return cur.replace(/\{(\w+)\}/g, (_, k: string) =>
      params[k] !== undefined ? String(params[k]) : `{${k}}`
    );
  },
}));

function buildKudo(i: number): Kudo {
  return {
    id: `k-${i}`,
    sender: { id: `s-${i}`, display_name: `Sender ${i}`, avatar_url: null, tier: "rising" },
    recipient: { id: `r-${i}`, display_name: `Recipient ${i}`, avatar_url: null, tier: "new" },
    title: "",
    is_anonymous: false,
    message: `Message ${i}`,
    hashtags: ["tag"],
    created_at: "2026-04-22T10:00:00Z",
    heart_count: 10 - i,
    liked_by_me: false,
    attachment_urls: [],
    share_url: `/kudos/k-${i}`,
  };
}

describe("<KudosHighlightsSection> carousel", () => {
  it("renders 5 highlight cards with first active and counter 1/5", () => {
    const kudos = Array.from({ length: 5 }, (_, i) => buildKudo(i + 1));
    renderSection(kudos);
    const actives = document.querySelectorAll('[data-active="true"]');
    expect(actives).toHaveLength(1);
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("prev disabled at slide 0", () => {
    renderSection(Array.from({ length: 5 }, (_, i) => buildKudo(i)));
    const prev = screen.getByRole("button", { name: /Kudo trước/i });
    expect(prev).toBeDisabled();
  });

  it("advances on next click; next disabled at last slide", () => {
    renderSection(Array.from({ length: 3 }, (_, i) => buildKudo(i)));
    const next = screen.getByRole("button", { name: /Kudo tiếp theo/i });
    fireEvent.click(next);
    expect(screen.getByText("2/3")).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByText("3/3")).toBeInTheDocument();
    expect(next).toBeDisabled();
  });

  it("shows empty state when no highlights", () => {
    renderSection([]);
    expect(screen.getByText(/Chưa có Kudo phù hợp/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Kudo trước/i })).toBeNull();
  });
});
