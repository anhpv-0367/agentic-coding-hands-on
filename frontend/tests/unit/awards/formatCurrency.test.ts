import { formatVnd, formatVndAmount } from "@/lib/format/currency";

describe("formatVndAmount", () => {
  it("formats numbers with dot separators in Vietnamese locale", () => {
    expect(formatVndAmount(7_000_000, "vi")).toBe("7.000.000");
    expect(formatVndAmount(15_000_000, "vi")).toBe("15.000.000");
  });

  it("formats numbers with comma separators in English locale", () => {
    expect(formatVndAmount(7_000_000, "en")).toBe("7,000,000");
    expect(formatVndAmount(15_000_000, "en")).toBe("15,000,000");
  });

  it("handles small and zero amounts", () => {
    expect(formatVndAmount(0, "vi")).toBe("0");
    expect(formatVndAmount(1000, "vi")).toBe("1.000");
    expect(formatVndAmount(1000, "en")).toBe("1,000");
  });
});

describe("formatVnd", () => {
  it("appends the locale-appropriate currency suffix", () => {
    expect(formatVnd(7_000_000, "vi", "VNĐ")).toBe("7.000.000 VNĐ");
    expect(formatVnd(7_000_000, "en", "VND")).toBe("7,000,000 VND");
  });
});
