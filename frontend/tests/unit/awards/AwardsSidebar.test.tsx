import { render, screen, fireEvent } from "@testing-library/react";
import type { AwardSlug } from "@/types/awards";
import AwardsSidebar from "@/components/awards/AwardsSidebar";

const items: ReadonlyArray<{ slug: AwardSlug; label: string }> = [
  { slug: "top-talent", label: "Top Talent" },
  { slug: "top-project", label: "Top Project" },
  { slug: "top-project-leader", label: "Top Project Leader" },
  { slug: "best-manager", label: "Best Manager" },
  { slug: "signature-2025-creator", label: "Signature 2025 - Creator" },
  { slug: "mvp", label: "MVP" },
];

describe("AwardsSidebar", () => {
  it("renders a <nav> with 6 links", () => {
    render(
      <AwardsSidebar
        items={items}
        activeSlug="top-talent"
        ariaLabel="Award categories"
        onNavigate={() => {}}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Award categories" });
    expect(nav).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(6);
  });

  it("marks the active item with aria-current=location", () => {
    render(
      <AwardsSidebar
        items={items}
        activeSlug="best-manager"
        ariaLabel="Award categories"
        onNavigate={() => {}}
      />
    );

    const active = screen.getByRole("link", { name: /Best Manager/ });
    expect(active).toHaveAttribute("aria-current", "location");

    const inactive = screen.getByRole("link", { name: /Top Talent/ });
    expect(inactive).not.toHaveAttribute("aria-current");
  });

  it("fires onNavigate with the slug when an item is clicked", () => {
    const onNavigate = jest.fn();
    render(
      <AwardsSidebar
        items={items}
        activeSlug="top-talent"
        ariaLabel="Award categories"
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: /MVP/ }));
    expect(onNavigate).toHaveBeenCalledWith("mvp");
  });

  it("prevents default on link click (handled by JS)", () => {
    const onNavigate = jest.fn();
    render(
      <AwardsSidebar
        items={items}
        activeSlug="top-talent"
        ariaLabel="Award categories"
        onNavigate={onNavigate}
      />
    );

    const link = screen.getByRole("link", { name: /Top Project Leader/ });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefault = jest.spyOn(event, "preventDefault");
    link.dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalled();
  });
});
