# Design Style: Login

**Frame ID**: `662:14387`
**Frame Name**: `Login`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
**Extracted At**: 2026-04-20

---

## Design Tokens

### Colors

| Token Name | Hex Value | Opacity | Usage |
|------------|-----------|---------|-------|
| --color-bg-page | #00101A | 100% | Page/screen background |
| --color-header-bg | #0B0F12 | 80% | Header bar background (rgba(11,15,18,0.8)) |
| --color-btn-login-bg | #FFEA9E | 100% | "LOGIN With Google" button background |
| --color-text-white | #FFFFFF | 100% | Header text, tagline, logo |
| --color-text-on-btn | #00101A | 100% | Login button text (dark on light button) |
| --color-footer-border | #2E3940 | 100% | Footer top divider |
| --color-error | #FF6B6B | 100% | Inline error message text |
| --color-gradient-left | linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%) | — | Left overlay gradient |
| --color-gradient-bottom | linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%) | — | Bottom overlay gradient |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|------------|-------------|------|--------|-------------|----------------|
| --text-btn-login | Montserrat | 22px | 700 | 28px | 0px |
| --text-tagline | Montserrat | 20px | 700 | 40px | 0.5px |
| --text-lang-label | Montserrat | 16px | 700 | 24px | 0.15px |
| --text-footer | Montserrat Alternates | 16px | 700 | 24px | 0% |
| --text-error | Montserrat | 14px | 500 | 20px | 0px |

### Spacing

| Token Name | Value | Usage |
|------------|-------|-------|
| --spacing-header-px | 144px | Header horizontal padding |
| --spacing-header-py | 12px | Header vertical padding |
| --spacing-content-px | 144px | Main content horizontal padding |
| --spacing-content-py | 96px | Main content vertical padding |
| --spacing-btn-px | 24px | Login button horizontal padding |
| --spacing-btn-py | 16px | Login button vertical padding |
| --spacing-footer-px | 90px | Footer horizontal padding |
| --spacing-footer-py | 40px | Footer vertical padding |
| --spacing-content-gap | 80px | Gap between key-visual and text group |
| --spacing-text-group-gap | 24px | Gap between tagline and button |

### Border & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| --radius-btn-login | 8px | Login button corner radius |
| --radius-lang-btn | 4px | Language selector button radius |
| --border-footer | 1px solid #2E3940 | Footer top divider |

### Shadows

None defined in this screen.

---

## Layout Specifications

### Container

| Property | Value | Notes |
|----------|-------|-------|
| width | 1440px | Desktop design width |
| height | 1024px | Desktop design height |
| background | #00101A | Dark navy page background |

### Layout Structure (ASCII)

```
┌────────────────────────────────────────────────────────────────────┐
│  Screen (1440×1024, bg: #00101A)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  mms_C_Keyvisual — abstract wave background image (full)     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Rectangle 57 — left-to-right gradient overlay (full)        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Cover — bottom gradient overlay (full)                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  mms_A_Header (1440×80, semi-transparent bg, px:144, py:12)  │  │
│  │  ┌──────────────┐                   ┌──────────────────────┐ │  │
│  │  │ mms_A.1_Logo │                   │ mms_A.2_Language     │ │  │
│  │  │ (52×56)      │                   │ (108×56, r:4px)      │ │  │
│  │  └──────────────┘                   └──────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  mms_B_Bìa (1440×845, px:144, py:96)                        │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  mms_B.1_Key Visual (451×200)                        │    │  │
│  │  │  "ROOT FURTHER" logo image                           │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │  [gap: 80px]                                                  │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  Frame 550 (pl:16px, flex-col, gap:24px)             │    │  │
│  │  │  ┌────────────────────────────────────────────────┐  │    │  │
│  │  │  │  mms_B.2_content (480×80)                      │  │    │  │
│  │  │  │  "Bắt đầu hành trình..." tagline text          │  │    │  │
│  │  │  └────────────────────────────────────────────────┘  │    │  │
│  │  │  [gap: 24px]                                          │    │  │
│  │  │  ┌────────────────────────────────────────────────┐  │    │  │
│  │  │  │  mms_B.3_Login (305×60)                        │  │    │  │
│  │  │  │  "LOGIN With Google" button (bg: #FFEA9E)      │  │    │  │
│  │  │  └────────────────────────────────────────────────┘  │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  mms_D_Footer (1440×91, px:90, py:40, border-top: #2E3940)  │  │
│  │              "Bản quyền thuộc về Sun* © 2025"                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### Header — `mms_A_Header` (Node: `662:14391`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | 662:14391 | — |
| width | 1440px | `width: 100%` |
| height | 80px | `height: 80px` |
| padding | 12px 144px | `padding: 12px 144px` |
| background | rgba(11,15,18,0.8) | `background-color: rgba(11,15,18,0.8)` |
| display | flex | `display: flex` |
| flex-direction | row | `flex-direction: row` |
| justify-content | space-between | `justify-content: space-between` |
| align-items | center | `align-items: center` |
| position | fixed; top: 0 | `position: fixed; top: 0` |

---

### Logo — `mms_A.1_Logo` (Node: `I662:14391;186:2166`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | I662:14391;186:2166 | — |
| width | 52px | `width: 52px` |
| height | 56px | `height: 56px` |
| type | Image (SAA logo) | `<img>` or background-image |

---

### Language Selector — `mms_A.2_Language` (Node: `I662:14391;186:1601`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | I662:14391;186:1601 | — |
| width | 108px | `width: 108px` |
| height | 56px | `height: 56px` |
| padding | 16px | `padding: 16px` |
| border-radius | 4px | `border-radius: 4px` |
| display | flex | `display: flex` |
| align-items | center | `align-items: center` |
| position | relative | `position: relative` |
| gap | 2px (inner) | `gap: 2px` |
| font-family | Montserrat | `font-family: 'Montserrat', sans-serif` |
| font-size | 16px | `font-size: 16px` |
| font-weight | 700 | `font-weight: 700` |
| line-height | 24px | `line-height: 24px` |
| letter-spacing | 0.15px | `letter-spacing: 0.15px` |
| color | #FFFFFF | `color: #FFFFFF` |

**Contents**: Flag icon (24×24) + locale label + dropdown chevron icon (24×24). Flag and label reflect current locale: VN → Vietnamese flag + "VN"; EN → US flag + "EN".

**States:**
| State | Changes |
|-------|---------|
| Default | No background, white text |
| Hover | background: rgba(255,255,255,0.08) |
| Focus | outline: 2px solid rgba(255,255,255,0.4), outline-offset: 2px |
| Active (dropdown open) | background: rgba(255,255,255,0.12) |

---

### Key Visual Logo — `mms_B.1_Key Visual` (Node: `662:14395`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | 662:14395 | — |
| width | 451px | `width: 451px` |
| height | 200px | `height: 200px` |
| type | Image ("ROOT FURTHER" decorative logo) | `<img>` or background-image |
| aspect-ratio | 115/51 | `aspect-ratio: 115 / 51` |

---

### Tagline Text — `mms_B.2_content` (Node: `662:14753`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | 662:14753 | — |
| width | 480px | `width: 480px` |
| height | 80px | `height: 80px` |
| font-family | Montserrat | `font-family: 'Montserrat', sans-serif` |
| font-size | 20px | `font-size: 20px` |
| font-weight | 700 | `font-weight: 700` |
| line-height | 40px | `line-height: 40px` |
| letter-spacing | 0.5px | `letter-spacing: 0.5px` |
| color | #FFFFFF | `color: #FFFFFF` |
| text-align | left | `text-align: left` |
| content | "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!" | 2-line text |

---

### Login Button — `mms_B.3_Login` / `Button-IC About` (Node: `662:14426`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | 662:14426 | — |
| width | 305px | `width: 305px` |
| height | 60px | `height: 60px` |
| padding | 16px 24px | `padding: 16px 24px` |
| background | #FFEA9E | `background-color: #FFEA9E` |
| border-radius | 8px | `border-radius: 8px` |
| display | flex | `display: flex` |
| align-items | center | `align-items: center` |
| justify-content | center | `justify-content: center` |
| flex-direction | row | `flex-direction: row` |
| gap | 4px (between label and Google icon) | `gap: 4px` |
| cursor | pointer | `cursor: pointer` |

**Button Label** (Node: `I662:14426;186:1568`):

| Property | Value |
|----------|-------|
| text | "LOGIN With Google" |
| font-family | Montserrat |
| font-size | 22px |
| font-weight | 700 |
| line-height | 28px |
| letter-spacing | 0px |
| color | #00101A |

**Google Icon** (Node: `I662:14426;186:1766`): 24×24px

**States:**
| State | Changes |
|-------|---------|
| Default | background: #FFEA9E |
| Hover | background: darken(#FFEA9E, 8%) — e.g. #F5DE7A |
| Active | background: darken(#FFEA9E, 15%) |
| Focus | outline: 2px solid #FFEA9E, outline-offset: 2px |
| Loading | opacity: 0.7, cursor: not-allowed |

---

### Footer — `mms_D_Footer` (Node: `662:14447`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | 662:14447 | — |
| width | 1440px | `width: 100%` |
| padding | 40px 90px | `padding: 40px 90px` |
| border-top | 1px solid #2E3940 | `border-top: 1px solid #2E3940` |
| display | flex | `display: flex` |
| align-items | center | `align-items: center` |
| justify-content | center | `justify-content: center` |

**Footer Text** (Node: `I662:14447;342:1413`):

| Property | Value |
|----------|-------|
| text | "Bản quyền thuộc về Sun* © 2025" |
| width | 275px |
| font-family | Montserrat Alternates |
| font-size | 16px |
| font-weight | 700 |
| line-height | 24px |
| letter-spacing | 0% |
| color | #FFFFFF |
| text-align | center |

---

### Language Dropdown Panel (open state — design not in Figma)

| Property | Value | CSS |
|----------|-------|-----|
| position | absolute; top: 100%; right: 0 | `position: absolute; top: 100%; right: 0` |
| background | rgba(11,15,18,0.95) | `background-color: rgba(11,15,18,0.95)` |
| border-radius | 4px | `border-radius: 4px` |
| min-width | 108px | `min-width: 108px` |
| padding | 4px 0 | `padding: 4px 0` |

Each option row:

| Property | Value |
|----------|-------|
| padding | 8px 16px |
| display | flex, align-items: center, gap: 8px |
| font | Montserrat 700 16px white |
| hover bg | rgba(255,255,255,0.08) |

Options:
- **VN** — Vietnamese flag (24×24) + "VN" label
- **EN** — US flag (24×24) + "EN" label

---

### Error Message (Inline — below Login Button)

Not present in Figma (error state not designed) — inferred from FR-005.

| Property | Value | CSS |
|----------|-------|-----|
| display | block | `display: block` |
| margin-top | 8px | `margin-top: 8px` |
| font-family | Montserrat | `font-family: 'Montserrat', sans-serif` |
| font-size | 14px | `font-size: 14px` |
| font-weight | 500 | `font-weight: 500` |
| line-height | 20px | `line-height: 20px` |
| color | #FF6B6B | `color: var(--color-error)` (red visible on dark bg) |
| role | alert | `role="alert"` (ARIA live region) |

---

## Z-Index Stacking Context

| Layer | Node | z-index | Notes |
|-------|------|---------|-------|
| Background image | mms_C_Keyvisual | 0 | Lowest layer — `absolute inset-0` |
| Left gradient | Rectangle 57 | 1 | Overlays background |
| Bottom gradient | Cover | 1 | Overlays background |
| Content section | mms_B_Bìa | 2 | Above gradient overlays |
| Footer | mms_D_Footer | 2 | Above gradient overlays |
| Header | mms_A_Header | 50 | Fixed positioned — must sit above all content |

---

## Background Image Positioning

### Key Visual Wave (`mms_C_Keyvisual`)

```css
background: url('path-to-wave-image') lightgray -440px -217.975px / 159.763% 133.371% no-repeat;
```

| Property | Value |
|----------|-------|
| background-position | -440px -217.975px |
| background-size | 159.763% 133.371% |
| background-repeat | no-repeat |
| background-color fallback | lightgray |

In Tailwind, use inline style for this non-standard positioning.

---

## Component Hierarchy with Styles

```
Screen (1440×1024, bg: #00101A)
├── mms_C_Keyvisual — abstract wave image (position: absolute, full-bleed)
├── Rectangle 57 — left gradient overlay (position: absolute, full-bleed)
├── Cover — bottom gradient overlay (position: absolute, full-bleed)
├── mms_A_Header (h:80, px:144, py:12, bg:rgba(11,15,18,0.8), flex row, space-between)
│   ├── mms_A.1_Logo (52×56, image)
│   └── mms_A.2_Language (108×56, flex row, gap:2, r:4, p:16)
│       ├── Flag icon (24×24) — VN flag when locale=vi, US flag when locale=en
│       ├── Locale label (Montserrat 700 16px white) — "VN" or "EN"
│       └── dropdown chevron (24×24)
├── mms_B_Bìa (1440×845, px:144, py:96, flex col, gap:80)
│   ├── mms_B.1_Key Visual (451×200, "ROOT FURTHER" image)
│   └── Frame 550 (pl:16, flex col, gap:24)
│       ├── mms_B.2_content (480×80, Montserrat 700 20px/40lh white)
│       │   └── "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!"
│       └── mms_B.3_Login (305×60, p:16/24, bg:#FFEA9E, r:8)
│           ├── "LOGIN With Google" (Montserrat 700 22px #00101A)
│           └── Google icon (24×24)
└── mms_D_Footer (w:100%, py:40, px:90, border-top: 1px #2E3940, flex, justify-center)
    └── "Bản quyền thuộc về Sun* © 2025" (Montserrat Alternates 700 16px white, center)
```

---

## Responsive Specifications

This design is desktop-first (1440px). For responsive implementation:

### Breakpoints

| Name | Min Width | Max Width |
|------|-----------|-----------|
| Mobile | 0 | 767px |
| Tablet | 768px | 1023px |
| Desktop | 1024px | ∞ |

### Responsive Changes

#### Mobile (< 768px)

| Component | Changes |
|-----------|---------|
| Header | padding: 12px 16px |
| Logo | width: 40px |
| Language selector | width: auto |
| Content section | padding: 80px 24px 48px |
| Key Visual ("ROOT FURTHER") | width: 100%, max-width: 280px |
| Tagline text | font-size: 16px, line-height: 28px, width: 100% |
| Login button | width: 100% |
| Footer | padding: 24px 16px, text-align: center |

#### Tablet (768px – 1023px)

| Component | Changes |
|-----------|---------|
| Header | padding: 12px 48px |
| Content section | padding: 80px 48px |
| Key Visual | width: 360px |
| Login button | width: auto |

---

## Icon Specifications

| Icon Name | Node ID | Size | Color | Usage |
|-----------|---------|------|-------|-------|
| VN Flag | I662:14391;186:1696;186:1821;186:1709 | 24×24 | — | Language selector — shown when locale=vi |
| US Flag | (dynamic — not in Figma) | 24×24 | — | Language selector — shown when locale=en |
| Dropdown chevron | I662:14391;186:1696;186:1821;186:1441 | 24×24 | #FFFFFF | Language dropdown |
| Google logo | I662:14426;186:1766 | 24×24 | multicolor | Login button |

All icons MUST be rendered via an Icon component, not raw `<svg>` or `<img>` tags.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Login button | background-color | 150ms | ease-in-out | Hover |
| Login button | opacity | 200ms | ease-in-out | Loading state |
| Language dropdown | opacity, transform | 150ms | ease-out | Toggle |

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS Class | Component |
|----------------|---------------|----------------------|-----------|
| Page background | 662:14387 | `min-h-screen bg-[var(--color-bg-page)]` | `<main>` |
| Header | 662:14391 | `fixed top-0 z-50 w-full h-20 flex items-center justify-between px-36 py-3 bg-[rgba(11,15,18,0.8)]` | `<Header>` |
| Logo | I662:14391;186:2166 | `w-13 h-14 object-contain` | `<Logo>` |
| Language selector | I662:14391;186:1601 | `flex items-center gap-0.5 px-4 py-4 rounded text-white font-bold text-base` | `<LanguageSelector>` |
| Background wave | 662:14388 | `absolute inset-0 -z-10` (inline style for bg-position) | `<div>` with inline style |
| Left gradient overlay | 662:14392 | `absolute inset-0 bg-gradient-to-r from-[var(--color-bg-page)] via-[var(--color-bg-page)] to-transparent` | `<div>` |
| Bottom gradient overlay | 662:14390 | `absolute inset-0 bg-gradient-to-t from-[var(--color-bg-page)] to-transparent` | `<div>` |
| Key Visual image | 662:14395 | `w-[451px] h-[200px] object-contain` | `<img alt="ROOT FURTHER">` |
| Tagline text | 662:14753 | `text-[var(--color-text-white)] font-bold text-xl leading-10 tracking-wide w-[480px]` | `<p>` |
| Login button | 662:14426 | `flex items-center gap-1 px-6 py-4 rounded-lg bg-[var(--color-btn-login-bg)] text-[var(--color-text-on-btn)] font-bold cursor-pointer` | `<LoginButton>` |
| Error message | (inferred) | `mt-2 text-[var(--color-error)] text-sm font-medium` | `<p role="alert">` |
| Footer | 662:14447 | `w-full flex items-center justify-center px-[90px] py-10 border-t border-[var(--color-footer-border)]` | `<Footer>` |
| Footer text | I662:14447;342:1413 | `text-[var(--color-text-white)] font-bold text-base text-center` | `<span>` |

---

## Notes

- All colors use CSS variables for theming; the dark theme (`#00101A`) is the only defined theme.
- The "ROOT FURTHER" key visual is a media asset — load from `public/assets/` or Supabase Storage.
- The abstract wave background is also a media asset.
- Font `Montserrat` and `Montserrat Alternates` must be loaded (Google Fonts or local).
- Ensure color contrast meets WCAG AA: white text on `#00101A` passes (21:1); `#00101A` on `#FFEA9E` passes (~12:1).
- All icons MUST use an Icon component instead of raw SVG files or img tags.
