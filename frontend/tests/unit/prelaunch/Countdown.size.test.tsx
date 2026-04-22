import { render, screen } from "@testing-library/react";
import Countdown from "@/components/homepage/Countdown";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, _params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      coming_soon: "Coming soon",
      "countdown.days": "DAYS",
      "countdown.hours": "HOURS",
      "countdown.minutes": "MINUTES",
      "countdown.aria_label": "Event countdown",
    };
    return map[key] ?? key;
  },
}));

describe("Countdown size variants", () => {
  const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  it("default size shows 'Coming soon' label", () => {
    render(<Countdown targetIso={future} />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("large size hides 'Coming soon' label", () => {
    render(<Countdown targetIso={future} size="large" />);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("always exposes aria-live polite region", () => {
    render(<Countdown targetIso={future} size="large" />);
    const live = screen
      .getByLabelText(/Event countdown/)
      .closest('[aria-live="polite"]');
    expect(live).not.toBeNull();
  });

  it("renders DAYS/HOURS/MINUTES labels", () => {
    render(<Countdown targetIso={future} size="large" />);
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });
});
