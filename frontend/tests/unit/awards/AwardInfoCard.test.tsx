import { render, screen } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import AwardInfoCard from "@/components/awards/AwardInfoCard";

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
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  );
}

jest.mock("next-intl", () => ({
  useLocale: () => "vi",
  useTranslations: (namespace: string) => {
    return (key: string, params?: Record<string, string | number>) => {
      const full = `${namespace}.${key}`;
      const value = resolve(viMessages as MessageMap, full);
      if (typeof value !== "string") return full;
      return format(value, params);
    };
  },
}));

function renderCard(
  slug: "top-talent" | "top-project" | "signature-2025-creator",
  index: number
) {
  return render(<AwardInfoCard slug={slug} index={index} />);
}

describe("AwardInfoCard", () => {
  it("renders Top Talent with picture, title, description, quantity and value", () => {
    renderCard("top-talent", 0);

    expect(
      screen.getByRole("heading", { level: 2, name: "Top Talent" })
    ).toBeInTheDocument();

    const picture = screen.getByRole("img", {
      name: /Biểu tượng giải Top Talent/,
    });
    expect(picture).toBeInTheDocument();
    expect(picture).toHaveAttribute(
      "src",
      "/assets/awards/images/top-talent.png"
    );

    expect(screen.getByText("Số lượng giải thưởng:")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Cá nhân")).toBeInTheDocument();

    expect(screen.getAllByText("Giá trị giải thưởng:").length).toBeGreaterThan(0);
    expect(screen.getByText("7.000.000 VNĐ")).toBeInTheDocument();
    expect(screen.getByText("cho mỗi giải thưởng")).toBeInTheDocument();
  });

  it("renders Signature 2025 - Creator with two value rows separated by Hoặc", () => {
    renderCard("signature-2025-creator", 4);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Signature 2025 - Creator",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Cá nhân hoặc tập thể")).toBeInTheDocument();

    expect(screen.getByText("5.000.000 VNĐ")).toBeInTheDocument();
    expect(screen.getByText("cho giải cá nhân")).toBeInTheDocument();
    expect(screen.getByText("8.000.000 VNĐ")).toBeInTheDocument();
    expect(screen.getByText("cho giải tập thể")).toBeInTheDocument();

    expect(screen.getByText("Hoặc")).toBeInTheDocument();
  });

  it("exposes the slug as a section id and data-award-slug attribute", () => {
    const { container } = renderCard("top-project", 1);
    const section = container.querySelector("section[data-award-slug]");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("id", "top-project");
    expect(section).toHaveAttribute("data-award-slug", "top-project");
  });

  it("applies alternating layout classes based on zero-based index", () => {
    const { container: c1 } = renderCard("top-talent", 0);
    const card1 = c1.querySelector<HTMLElement>('[data-card-root="true"]');
    expect(card1?.getAttribute("data-card-mirror")).toBe("false");

    const { container: c2 } = renderCard("top-project", 1);
    const card2 = c2.querySelector<HTMLElement>('[data-card-root="true"]');
    expect(card2?.getAttribute("data-card-mirror")).toBe("true");
  });
});
