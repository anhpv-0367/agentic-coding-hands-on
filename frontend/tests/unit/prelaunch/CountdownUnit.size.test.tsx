import { render, screen } from "@testing-library/react";
import CountdownUnit from "@/components/homepage/CountdownUnit";

describe("CountdownUnit size variants", () => {
  it("default size: label Montserrat 24/700/32", () => {
    render(<CountdownUnit value={7} label="DAYS" />);
    const label = screen.getByText("DAYS");
    expect(label).toHaveStyle({ fontSize: "24px", fontWeight: "700", lineHeight: "32px" });
  });

  it("large size: label Montserrat 36/700/48", () => {
    render(<CountdownUnit value={5} label="HOURS" size="large" />);
    const label = screen.getByText("HOURS");
    expect(label).toHaveStyle({ fontSize: "36px", fontWeight: "700", lineHeight: "48px" });
  });

  it("renders two zero-padded digits", () => {
    render(<CountdownUnit value={9} label="MINUTES" size="large" />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });
});
