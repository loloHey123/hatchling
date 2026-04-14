# UI Overhaul: Polished Retro Pixel + Theming System

**Date:** 2026-04-13
**Status:** Draft
**Default palette:** Sunset Garden

---

## 1. Problem

The current UI uses hardcoded colors (`#333`, `#78c850`, etc.) everywhere, Press Start 2P font at illegible sizes, emoji instead of sprites, and creature cards that show a letter in a colored box. The extension popup is all inline styles with no shared design language. It reads as a prototype, not a product.

## 2. Goals

1. Ship a CSS-variable-based theming system with 8 curated preset palettes
2. Add a palette selector to the Settings page
3. Replace placeholder creature/egg rendering with real pixel art sprites (CSS box-shadow technique)
4. Establish a consistent type scale and spacing system
5. Unify extension popup styling with the web app's design tokens

## 3. Theming System

### 3.1 CSS Variables

All colors flow through CSS custom properties on `:root`. Every component references these — zero hardcoded color values.

```
--color-bg           Background (deepest layer)
--color-surface      Cards, panels, elevated surfaces
--color-border       Borders, dividers
--color-text         Primary text
--color-text-muted   Secondary/label text
--color-accent       Primary accent (logo, highlights, active states)
--color-accent-secondary  Secondary accent (progress bars, tags)
--color-success      Positive actions (hatch, save)
--color-warning      Token costs, timers
--color-danger       Destructive actions, errors
```

Rarity colors remain fixed across all palettes (they're part of the game identity, not the theme):
- Common: `#a8a878`
- Uncommon: `#78c850`
- Rare: `#6890f0`
- Legendary: `#f8d030`
- Mythic: `#f85888`

### 3.2 Preset Palettes

Each palette defines all 10 CSS variables. Palettes are stored in `packages/shared/src/palettes.ts` so both web and extension can import them.

| # | Name | bg | surface | border | text | text-muted | accent | accent-secondary | Vibe |
|---|------|-----|---------|--------|------|------------|--------|-----------------|------|
| 1 | **Sunset Garden** (default) | `#1e1a20` | `#28222e` | `#3a3040` | `#d8c8d0` | `#8a7890` | `#f0a8a0` | `#a8d0a0` | Dusky plum, peach, sage. Ghibli twilight. |
| 2 | **Campfire** | `#2a1f16` | `#352818` | `#4a3828` | `#d8c0a0` | `#8a7060` | `#f0a050` | `#70b0d8` | Chocolate, amber, cream. Cozy cabin. |
| 3 | **Golden Hour** | `#17201e` | `#1c2825` | `#2a3a35` | `#c0d8c8` | `#6a8a80` | `#e8c868` | `#88c8a0` | Forest teal, gold, jade. Enchanted dusk. |
| 4 | **Midnight Ocean** | `#0f1520` | `#151d2a` | `#243040` | `#b8c8d8` | `#607088` | `#58a8e0` | `#a0d0e8` | Deep navy, cyan, silver. Mysterious depths. |
| 5 | **Cherry Blossom** | `#201818` | `#2a2020` | `#402e30` | `#e0c8c8` | `#907070` | `#e87088` | `#f0b0b8` | Warm rose, pink, soft cream. Springtime. |
| 6 | **Fossil** | `#1a1a18` | `#242420` | `#383830` | `#c8c0b0` | `#888070` | `#c8a070` | `#a09078` | Stone gray, tan, terracotta. Vintage dig. |
| 7 | **Aurora** | `#0e0e1a` | `#161628` | `#262640` | `#c8c0e0` | `#706890` | `#60e0a0` | `#b080f0` | Indigo, neon green, electric purple. Magical. |
| 8 | **Honeycomb** | `#201810` | `#2a2018` | `#403020` | `#d8c8a0` | `#908060` | `#e0a030` | `#c87830` | Mustard, burnt orange, walnut. Retro warmth. |

`success`, `warning`, and `danger` are the same across palettes:
- Success: `#78c850`
- Warning: `#f8d030`
- Danger: `#f85888`

### 3.3 Persistence

- Palette preference is stored in the `profiles` table as a new `theme_palette` column (text, default `'sunset-garden'`)
- On load, the app reads the user's palette and sets CSS variables on `<html>`
- Unauthenticated users get Sunset Garden; preference is saved to localStorage as fallback
- Extension reads the palette from the same Supabase profile and applies matching inline styles

### 3.4 Palette Selector (Settings Page)

A grid of palette preview cards inside a new "Theme" PixelFrame section at the top of Settings. Each card shows:
- The palette name (pixel font, 8px)
- A horizontal strip of 5 color swatches (bg, surface, accent, accent-secondary, text)
- A selected/unselected border state

Selecting a palette applies it immediately (optimistic) and saves to Supabase in the background. No confirmation step needed.

## 4. Pixel Art Sprite System

### 4.1 Approach: CSS Box-Shadow Sprites

Instead of shipping 115+ PNG files, sprites are defined as CSS box-shadow arrays. This approach:
- Is resolution-independent (scales with `image-rendering: pixelated`)
- Requires zero asset loading / CDN
- Can be generated programmatically
- Keeps the authentic pixel art feel

Each sprite is a 16x16 or 32x32 grid encoded as a box-shadow string.

### 4.2 Sprite Data Structure

```typescript
// packages/shared/src/sprites.ts
interface SpriteDefinition {
  id: string;           // matches creature_defs.id
  name: string;
  width: number;        // grid width (16 or 32)
  height: number;       // grid height
  pixelSize: number;    // size of each "pixel" in CSS px (default 2)
  pixels: string;       // box-shadow value string
}
```

### 4.3 Sprite Component

```typescript
// packages/web/src/components/PixelSprite.tsx
interface PixelSpriteProps {
  sprite: SpriteDefinition;
  scale?: number;       // multiplier (default 1)
  className?: string;
}
```

Renders a `<div>` with a `::before` pseudo-element containing the box-shadow. Scale adjusts `pixelSize`.

### 4.4 Sprite Coverage

Phase 1 (this spec):
- 12 starter creatures (2-3 per rarity tier) with unique sprites
- 5 egg types (one per rarity) with distinct color/pattern sprites
- Remaining 103 creatures get procedurally varied silhouettes (rotations, color shifts of base shapes per element type)

Phase 2 (future):
- Hand-craft remaining creatures
- Animated idle sprites (2-frame alternation)
- Cosmetic overlays

### 4.5 CreatureCard Update

Replace the current "letter in a colored box" with:
- Owned: Full-color PixelSprite at 32x32
- Unowned: Black silhouette (CSS `filter: brightness(0)`) at reduced opacity
- Hover: Subtle bounce animation (translateY -2px)

## 5. Typography Scale

Replace the current chaos of `text-[7px]` through `text-[16px]` with a fixed scale:

| Token | Size | Use |
|-------|------|-----|
| `text-pixel-xs` | 7px | Rarity badges, tiny labels |
| `text-pixel-sm` | 9px | Card labels, secondary info |
| `text-pixel-base` | 11px | Body text, nav items |
| `text-pixel-lg` | 14px | Section headers, stat values |
| `text-pixel-xl` | 18px | Page titles |
| `text-pixel-2xl` | 24px | Hero/splash text |

All sizes use `Press Start 2P`. The key fix is **consistency** — every text element maps to one of these 6 sizes.

## 6. Spacing & Shadows

### 6.1 Shadow Elevation System

Replace scattered `shadow-[3px_3px_0_#333]` / `shadow-[4px_4px_0_#333]` with semantic levels that reference `--color-border`:

| Level | Shadow | Use |
|-------|--------|-----|
| `shadow-pixel-sm` | `2px 2px 0` | Small elements, tags, badges |
| `shadow-pixel-md` | `3px 3px 0` | Cards, buttons |
| `shadow-pixel-lg` | `4px 4px 0` | Modals, popups, hero frames |

Shadow color = `var(--color-border)` so it adapts to the palette.

### 6.2 Border Width

Standardize to 2px for cards/inputs, 3px for major frames (PixelFrame, dashboard panels).

## 7. Component Updates

### 7.1 PixelButton

- Replace hardcoded `#333` shadow with `var(--color-border)`
- Replace `#78c850` primary color with `var(--color-accent)` for primary variant
- Replace `#e8e8e8` secondary with `var(--color-surface)`
- Replace `#f85888` danger with `var(--color-danger)`

### 7.2 PixelFrame

- Background: `var(--color-surface)`
- Border: `var(--color-border)`
- Shadow: `shadow-pixel-lg` using `var(--color-border)`

### 7.3 CreatureCard

- Replace letter-in-box with `<PixelSprite>`
- Background: `var(--color-surface)`
- Border: `var(--color-border)`
- Hover border: `var(--color-accent)`

### 7.4 Egg Cards (Dashboard)

- Replace plain colored boxes with `<PixelSprite>` egg sprites
- Progress bar uses rarity color (fixed) on `var(--color-border)` track
- Timer text in `var(--color-accent)`

### 7.5 Extension Popup

- Replace all inline `#333`, `#78c850`, `#888` etc. with palette values
- Import palette definitions from shared package
- Apply palette as inline CSS variables on the popup root element
- Match web app's visual language (same border widths, shadow style, type scale)

## 8. Database Change

Single migration:

```sql
ALTER TABLE profiles ADD COLUMN theme_palette text NOT NULL DEFAULT 'sunset-garden';
```

## 9. File Changes Summary

| File | Change |
|------|--------|
| `packages/shared/src/palettes.ts` | **New.** Palette definitions + types |
| `packages/shared/src/sprites.ts` | **New.** Sprite data for creatures + eggs |
| `packages/shared/src/index.ts` | Export new modules |
| `packages/web/src/styles/globals.css` | CSS variables on `:root`, type scale utilities, shadow utilities |
| `packages/web/tailwind.config.js` | Extend with CSS variable references, type scale, shadow tokens |
| `packages/web/src/components/PixelSprite.tsx` | **New.** Sprite renderer component |
| `packages/web/src/components/PixelButton.tsx` | Replace hardcoded colors with CSS vars |
| `packages/web/src/components/PixelFrame.tsx` | Replace hardcoded colors with CSS vars |
| `packages/web/src/components/CreatureCard.tsx` | Use PixelSprite, themed colors |
| `packages/web/src/pages/Settings.tsx` | Add palette selector section |
| `packages/web/src/pages/Dashboard.tsx` | Themed colors, sprite eggs |
| `packages/web/src/pages/GachaMachine.tsx` | Themed colors |
| `packages/web/src/components/GachaPull.tsx` | Themed colors, sprite reveal |
| `packages/web/src/pages/Collection.tsx` | Themed colors |
| `packages/web/src/pages/Store.tsx` | Themed colors |
| `packages/web/src/pages/Stats.tsx` | Themed colors |
| `packages/web/src/pages/Safari.tsx` | Themed colors |
| `packages/web/src/pages/Landing.tsx` | Themed colors |
| `packages/extension/src/popup/Popup.tsx` | Use palette system, match web styling |
| `packages/extension/src/options/Options.tsx` | Use palette system |
| `supabase/migrations/008_add_theme_palette.sql` | Add `theme_palette` column |

## 10. Out of Scope

- Animated sprites (idle, hatch sequences) — future phase
- Light mode palettes — all 8 are dark mode; light mode can be added later
- Custom color picker — presets only for now
- Cosmetic overlays on sprites — future phase
