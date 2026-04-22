"use client";

import type { AwardSlug } from "@/types/awards";
import AwardsSidebarItem from "./AwardsSidebarItem";

type SidebarItem = {
  slug: AwardSlug;
  label: string;
};

type Props = {
  items: ReadonlyArray<SidebarItem>;
  activeSlug: AwardSlug | null;
  ariaLabel: string;
  onNavigate: (slug: AwardSlug) => void;
};

export default function AwardsSidebar({
  items,
  activeSlug,
  ariaLabel,
  onNavigate,
}: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className="hidden lg:flex"
      style={{
        flexDirection: "column",
        width: "178px",
        flexShrink: 0,
        position: "sticky",
        top: "104px",
        alignSelf: "flex-start",
      }}
    >
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-awards-sidebar-gap, 16px)",
        }}
      >
        {items.map((item) => (
          <li key={item.slug}>
            <AwardsSidebarItem
              slug={item.slug}
              label={item.label}
              isActive={activeSlug === item.slug}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}
