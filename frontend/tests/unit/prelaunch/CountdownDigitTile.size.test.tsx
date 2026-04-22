import { render, screen } from "@testing-library/react";
import CountdownDigitTile from "@/components/homepage/CountdownDigitTile";

describe("CountdownDigitTile size variants", () => {
  it("default size: 51.2 × 81.92, radius 8px, border 0.5px, font 49.152px", () => {
    render(<CountdownDigitTile char="7" />);
    const digit = screen.getByText("7");
    const tile = digit.closest("div");
    expect(tile).toHaveStyle({ width: "51.2px", height: "81.92px" });
    expect(tile).toHaveStyle({ borderRadius: "8px" });
  });

  it("large size: 77 × 123, radius 12px, border 0.75px, font 73.728px", () => {
    render(<CountdownDigitTile char="5" size="large" />);
    const digit = screen.getByText("5");
    const tile = digit.closest("div");
    expect(tile).toHaveStyle({ width: "77px", height: "123px" });
    expect(tile).toHaveStyle({ borderRadius: "12px" });
  });

  it("large size font size is 73.728px", () => {
    render(<CountdownDigitTile char="0" size="large" />);
    const digit = screen.getByText("0");
    expect(digit).toHaveStyle({ fontSize: "73.728px" });
  });

  it("default size font is 49.152px", () => {
    render(<CountdownDigitTile char="3" />);
    const digit = screen.getByText("3");
    expect(digit).toHaveStyle({ fontSize: "49.152px" });
  });
});
