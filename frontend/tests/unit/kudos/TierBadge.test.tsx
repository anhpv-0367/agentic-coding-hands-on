import { render, screen } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import TierBadge from "@/components/kudos/TierBadge";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => {
    // Resolve kudos.user.tier.<key>
    const path = `${ns}.${key}`.split(".");
    let cur: unknown = viMessages;
    for (const p of path) {
      if (typeof cur !== "object" || cur === null) return path.join(".");
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" ? cur : path.join(".");
  },
}));

describe("<TierBadge>", () => {
  it.each(["new", "rising", "super", "legend"] as const)("renders %s label", (tier) => {
    render(<TierBadge tier={tier} />);
    const labels: Record<typeof tier, string> = {
      new: "New Hero",
      rising: "Rising Hero",
      super: "Super Hero",
      legend: "Legend Hero",
    };
    expect(screen.getByText(labels[tier])).toBeInTheDocument();
  });

  it("renders with correct data-tier attribute", () => {
    render(<TierBadge tier="legend" />);
    expect(screen.getByText("Legend Hero").closest('[data-tier="legend"]')).toBeInTheDocument();
  });
});
