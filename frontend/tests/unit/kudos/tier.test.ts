import { computeTier } from "@/lib/kudos/tier";

describe("computeTier", () => {
  it.each([
    [0, "new"],
    [1, "new"],
    [9, "new"],
    [10, "rising"],
    [15, "rising"],
    [29, "rising"],
    [30, "super"],
    [50, "super"],
    [99, "super"],
    [100, "legend"],
    [500, "legend"],
  ] as const)("received=%i → %s", (received, expected) => {
    expect(computeTier(received)).toBe(expected);
  });

  it("treats negative input as new (defensive)", () => {
    expect(computeTier(-1)).toBe("new");
  });
});
