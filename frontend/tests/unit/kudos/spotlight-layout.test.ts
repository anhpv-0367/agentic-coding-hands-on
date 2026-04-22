import { layoutNodes, type LayoutInput, type PlacedNode } from "@/lib/kudos/spotlight-layout";

function mockInput(count: number, avgNameLen = 14): LayoutInput {
  return {
    nodes: Array.from({ length: count }, (_, i) => ({
      kudo_id: `kudo-${i}`,
      label: `Sunner ${String(i).padStart(2, "0")}`.padEnd(avgNameLen, "x"),
    })),
    bounds: { width: 1100, height: 540 },
  };
}

describe("layoutNodes", () => {
  it("returns one placement per input node", () => {
    const input = mockInput(30);
    const out = layoutNodes(input);
    expect(out).toHaveLength(30);
    for (let i = 0; i < 30; i++) {
      expect(out[i].kudo_id).toBe(input.nodes[i].kudo_id);
    }
  });

  it("keeps placements inside bounds", () => {
    const input = mockInput(50);
    const out = layoutNodes(input);
    for (const p of out) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width).toBeLessThanOrEqual(input.bounds.width);
      expect(p.y + p.height).toBeLessThanOrEqual(input.bounds.height);
    }
  });

  it("produces no overlapping AABBs for up to 60 nodes at default font size", () => {
    const input = mockInput(60);
    const out = layoutNodes(input);
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i];
        const b = out[j];
        const overlap =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;
        expect(overlap).toBe(false);
      }
    }
  });

  it("is deterministic for the same input", () => {
    const input = mockInput(40);
    const a = layoutNodes(input);
    const b = layoutNodes(input);
    expect(a).toEqual(b);
  });

  it("returns empty array for empty input", () => {
    const out = layoutNodes({ nodes: [], bounds: { width: 500, height: 300 } });
    expect(out).toEqual<PlacedNode[]>([]);
  });

  it("gives up gracefully when canvas is too small", () => {
    const out = layoutNodes({
      nodes: Array.from({ length: 200 }, (_, i) => ({ kudo_id: `k-${i}`, label: "X".repeat(20) })),
      bounds: { width: 120, height: 80 },
    });
    // Still returns one entry per node; unplaced ones are clamped to origin.
    expect(out).toHaveLength(200);
  });
});
