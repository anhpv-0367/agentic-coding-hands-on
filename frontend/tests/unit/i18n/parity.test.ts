import viMessages from "@/i18n/messages/vi.json";
import enMessages from "@/i18n/messages/en.json";

type MessageTree = { [key: string]: string | MessageTree };

function flatten(node: MessageTree, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      keys.push(path);
    } else if (value && typeof value === "object") {
      keys.push(...flatten(value, path));
    }
  }
  return keys.sort();
}

describe("i18n parity", () => {
  it("vi.json and en.json have identical key sets", () => {
    const viKeys = flatten(viMessages as unknown as MessageTree);
    const enKeys = flatten(enMessages as unknown as MessageTree);

    const onlyInVi = viKeys.filter((k) => !enKeys.includes(k));
    const onlyInEn = enKeys.filter((k) => !viKeys.includes(k));

    expect(onlyInVi).toEqual([]);
    expect(onlyInEn).toEqual([]);
  });

  it("covers the awards.* namespace in both locales", () => {
    const viKeys = flatten(viMessages as unknown as MessageTree).filter((k) =>
      k.startsWith("awards.")
    );
    const enKeys = flatten(enMessages as unknown as MessageTree).filter((k) =>
      k.startsWith("awards.")
    );

    expect(viKeys.length).toBeGreaterThan(0);
    expect(viKeys).toEqual(enKeys);
  });

  it("covers the kudos.* namespace in both locales", () => {
    const viKeys = flatten(viMessages as unknown as MessageTree).filter((k) =>
      k.startsWith("kudos.")
    );
    const enKeys = flatten(enMessages as unknown as MessageTree).filter((k) =>
      k.startsWith("kudos.")
    );

    expect(viKeys.length).toBeGreaterThan(0);
    expect(viKeys).toEqual(enKeys);
  });
});
