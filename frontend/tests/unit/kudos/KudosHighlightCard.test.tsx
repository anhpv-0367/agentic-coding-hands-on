import { render, screen } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import KudosHighlightCard from "@/components/kudos/KudosHighlightCard";
import ToastProvider from "@/components/ui/ToastProvider";
import type { Kudo } from "@/types/kudos";

jest.mock("@/lib/services/kudos-service", () => ({
  addReaction: jest.fn().mockResolvedValue({ heart_count: 0 }),
  removeReaction: jest.fn().mockResolvedValue({ heart_count: 0 }),
}));

type MessageMap = Record<string, unknown>;

function resolve(messages: MessageMap, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = messages;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function format(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_m, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  );
}

jest.mock("next-intl", () => ({
  useLocale: () => "vi",
  useTranslations: (namespace: string) =>
    (key: string, params?: Record<string, string | number>) => {
      const value = resolve(viMessages as MessageMap, `${namespace}.${key}`);
      if (typeof value !== "string") return `${namespace}.${key}`;
      return format(value, params);
    },
}));

const KUDO: Kudo = {
  id: "k-1",
  sender: {
    id: "u-s",
    display_name: "Đỗ hoàng Hiệp",
    avatar_url: null,
    tier: "super",
  },
  recipient: {
    id: "u-r",
    display_name: "Nguyễn Bá Chức",
    avatar_url: null,
    tier: "rising",
  },
  title: "",
  is_anonymous: false,
  message:
    "Cảm ơn bạn vì đã hỗ trợ team trong sprint vừa rồi, bạn là một người đồng đội tuyệt vời.",
  hashtags: ["IDOL GIỚI TRẺ", "Dedicated", "Inspiring", "Teamwork", "Creator", "Mentor"],
  created_at: "2026-04-22T10:00:00Z",
  heart_count: 42,
  liked_by_me: false,
  attachment_urls: [],
  share_url: "/kudos/k-1",
};

function renderCard(isActive: boolean) {
  return render(
    <ToastProvider>
      <KudosHighlightCard kudo={KUDO} isActive={isActive} />
    </ToastProvider>
  );
}

describe("<KudosHighlightCard>", () => {
  it("renders sender, recipient, message, and hashtags", () => {
    renderCard(true);
    expect(screen.getByText(/Đỗ hoàng Hiệp/)).toBeInTheDocument();
    expect(screen.getByText(/Nguyễn Bá Chức/)).toBeInTheDocument();
    expect(screen.getByText(/Cảm ơn bạn/)).toBeInTheDocument();
    // Primary hashtag shows as both chip and list; assert via a non-primary hashtag.
    expect(screen.getByText("#Inspiring")).toBeInTheDocument();
  });

  it("clamps hashtags to 5 visible with ellipsis marker", () => {
    renderCard(true);
    const ul = screen.getByText("#Inspiring").closest("ul");
    expect(ul).not.toBeNull();
    const items = ul!.querySelectorAll("li");
    expect(items).toHaveLength(6);
    expect(items[items.length - 1].textContent).toBe("…");
  });

  it("marks active vs inactive via data-active attribute", () => {
    const { container, rerender } = render(
      <ToastProvider>
        <KudosHighlightCard kudo={KUDO} isActive={true} />
      </ToastProvider>
    );
    expect(container.querySelector('[data-active="true"]')).not.toBeNull();

    rerender(
      <ToastProvider>
        <KudosHighlightCard kudo={KUDO} isActive={false} />
      </ToastProvider>
    );
    expect(container.querySelector('[data-active="false"]')).not.toBeNull();
  });

  it("includes the heart count in the action row", () => {
    renderCard(true);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
