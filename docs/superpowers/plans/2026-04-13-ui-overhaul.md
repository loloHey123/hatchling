# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the prototype-quality UI with a polished retro pixel art design system featuring 8 theme palettes, real pixel sprites, and consistent typography.

**Architecture:** CSS custom properties on `:root` drive all colors. Palette definitions live in `@hatchling/shared` so both web and extension can use them. A `useTheme` hook loads the user's palette from Supabase/localStorage and applies it. Every component references CSS vars instead of hardcoded hex values.

**Tech Stack:** React 18, Tailwind CSS 3, Supabase (Postgres), Preact (extension), CSS custom properties

**Spec:** `docs/superpowers/specs/2026-04-13-ui-overhaul-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/shared/src/palettes.ts` | Create | Palette type + 8 palette definitions |
| `packages/shared/src/sprites.ts` | Create | Sprite type + creature/egg sprite data |
| `packages/shared/src/index.ts` | Modify | Export new modules |
| `packages/web/src/styles/globals.css` | Modify | Full CSS variable set, type scale, shadow utilities |
| `packages/web/tailwind.config.js` | Modify | CSS var references, type scale, shadow tokens |
| `packages/web/src/hooks/useTheme.ts` | Create | Load/save palette, apply CSS vars |
| `packages/web/src/components/PixelSprite.tsx` | Create | Render sprites via box-shadow |
| `packages/web/src/components/PixelButton.tsx` | Modify | Use CSS vars |
| `packages/web/src/components/PixelFrame.tsx` | Modify | Use CSS vars |
| `packages/web/src/components/CreatureCard.tsx` | Modify | Use PixelSprite + CSS vars |
| `packages/web/src/components/EggCard.tsx` | Modify | Use PixelSprite + CSS vars |
| `packages/web/src/pages/Settings.tsx` | Modify | Add palette selector, use CSS vars |
| `packages/web/src/pages/Dashboard.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/GachaMachine.tsx` | Modify | Use CSS vars |
| `packages/web/src/components/GachaPull.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/Collection.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/Store.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/Stats.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/Safari.tsx` | Modify | Use CSS vars |
| `packages/web/src/pages/Landing.tsx` | Modify | Use CSS vars |
| `packages/web/src/App.tsx` | Modify | Wrap with theme provider |
| `packages/extension/src/popup/Popup.tsx` | Modify | Use palette system |
| `supabase/migrations/008_add_theme_palette.sql` | Create | Add theme_palette column |

---

### Task 1: Palette Definitions in Shared Package

**Files:**
- Create: `packages/shared/src/palettes.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create palette types and definitions**

Create `packages/shared/src/palettes.ts`:

```typescript
export interface ThemePalette {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSecondary: string;
    success: string;
    warning: string;
    danger: string;
  };
}

export const PALETTES: ThemePalette[] = [
  {
    id: 'sunset-garden',
    name: 'Sunset Garden',
    colors: {
      bg: '#1e1a20',
      surface: '#28222e',
      border: '#3a3040',
      text: '#d8c8d0',
      textMuted: '#8a7890',
      accent: '#f0a8a0',
      accentSecondary: '#a8d0a0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'campfire',
    name: 'Campfire',
    colors: {
      bg: '#2a1f16',
      surface: '#352818',
      border: '#4a3828',
      text: '#d8c0a0',
      textMuted: '#8a7060',
      accent: '#f0a050',
      accentSecondary: '#70b0d8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: {
      bg: '#17201e',
      surface: '#1c2825',
      border: '#2a3a35',
      text: '#c0d8c8',
      textMuted: '#6a8a80',
      accent: '#e8c868',
      accentSecondary: '#88c8a0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    colors: {
      bg: '#0f1520',
      surface: '#151d2a',
      border: '#243040',
      text: '#b8c8d8',
      textMuted: '#607088',
      accent: '#58a8e0',
      accentSecondary: '#a0d0e8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    colors: {
      bg: '#201818',
      surface: '#2a2020',
      border: '#402e30',
      text: '#e0c8c8',
      textMuted: '#907070',
      accent: '#e87088',
      accentSecondary: '#f0b0b8',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'fossil',
    name: 'Fossil',
    colors: {
      bg: '#1a1a18',
      surface: '#242420',
      border: '#383830',
      text: '#c8c0b0',
      textMuted: '#888070',
      accent: '#c8a070',
      accentSecondary: '#a09078',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: {
      bg: '#0e0e1a',
      surface: '#161628',
      border: '#262640',
      text: '#c8c0e0',
      textMuted: '#706890',
      accent: '#60e0a0',
      accentSecondary: '#b080f0',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    colors: {
      bg: '#201810',
      surface: '#2a2018',
      border: '#403020',
      text: '#d8c8a0',
      textMuted: '#908060',
      accent: '#e0a030',
      accentSecondary: '#c87830',
      success: '#78c850',
      warning: '#f8d030',
      danger: '#f85888',
    },
  },
];

export const DEFAULT_PALETTE_ID = 'sunset-garden';

export function getPalette(id: string): ThemePalette {
  return PALETTES.find(p => p.id === id) ?? PALETTES[0];
}
```

- [ ] **Step 2: Export from shared index**

In `packages/shared/src/index.ts`, add to the existing exports:

```typescript
export * from './types';
export * from './constants';
export * from './rarity';
export * from './palettes';
```

- [ ] **Step 3: Verify it compiles**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/palettes.ts packages/shared/src/index.ts
git commit -m "feat: add palette definitions to shared package"
```

---

### Task 2: CSS Variables, Type Scale, and Tailwind Config

**Files:**
- Modify: `packages/web/src/styles/globals.css`
- Modify: `packages/web/tailwind.config.js`

- [ ] **Step 1: Replace globals.css with full theme variable system**

Replace the entire contents of `packages/web/src/styles/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Theme palette — set dynamically by useTheme hook */
  --color-bg: #1e1a20;
  --color-surface: #28222e;
  --color-border: #3a3040;
  --color-text: #d8c8d0;
  --color-text-muted: #8a7890;
  --color-accent: #f0a8a0;
  --color-accent-secondary: #a8d0a0;
  --color-success: #78c850;
  --color-warning: #f8d030;
  --color-danger: #f85888;

  /* Rarity colors — fixed across all palettes */
  --color-rarity-common: #a8a878;
  --color-rarity-uncommon: #78c850;
  --color-rarity-rare: #6890f0;
  --color-rarity-legendary: #f8d030;
  --color-rarity-mythic: #f85888;
}

body {
  font-family: 'Press Start 2P', monospace;
  background-color: var(--color-bg);
  color: var(--color-text);
  image-rendering: pixelated;
  margin: 0;
}

* {
  box-sizing: border-box;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border: 2px solid var(--color-bg);
}

/* Shadow utilities */
@layer utilities {
  .shadow-pixel-sm {
    box-shadow: 2px 2px 0 var(--color-border);
  }
  .shadow-pixel-md {
    box-shadow: 3px 3px 0 var(--color-border);
  }
  .shadow-pixel-lg {
    box-shadow: 4px 4px 0 var(--color-border);
  }
  .shadow-pixel-pressed {
    box-shadow: 1px 1px 0 var(--color-border);
  }
}
```

- [ ] **Step 2: Update tailwind.config.js**

Replace the entire contents of `packages/web/tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          accent: 'var(--color-accent)',
          'accent-secondary': 'var(--color-accent-secondary)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        },
        rarity: {
          common: 'var(--color-rarity-common)',
          uncommon: 'var(--color-rarity-uncommon)',
          rare: 'var(--color-rarity-rare)',
          legendary: 'var(--color-rarity-legendary)',
          mythic: 'var(--color-rarity-mythic)',
        },
      },
      fontSize: {
        'pixel-xs': ['7px', { lineHeight: '1.4' }],
        'pixel-sm': ['9px', { lineHeight: '1.4' }],
        'pixel-base': ['11px', { lineHeight: '1.5' }],
        'pixel-lg': ['14px', { lineHeight: '1.4' }],
        'pixel-xl': ['18px', { lineHeight: '1.3' }],
        'pixel-2xl': ['24px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Verify Tailwind compiles**

Run: `cd packages/web && npx tailwindcss --content './src/**/*.tsx' --output /dev/null`
Expected: No errors (warnings about unused classes are fine)

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/styles/globals.css packages/web/tailwind.config.js
git commit -m "feat: add CSS variable theming system and type scale"
```

---

### Task 3: useTheme Hook

**Files:**
- Create: `packages/web/src/hooks/useTheme.ts`
- Modify: `packages/web/src/App.tsx`

- [ ] **Step 1: Create the useTheme hook**

Create `packages/web/src/hooks/useTheme.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { getPalette, DEFAULT_PALETTE_ID, PALETTES } from '@hatchling/shared';
import type { ThemePalette } from '@hatchling/shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const STORAGE_KEY = 'hatchling_palette';

function applyPalette(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', palette.colors.bg);
  root.style.setProperty('--color-surface', palette.colors.surface);
  root.style.setProperty('--color-border', palette.colors.border);
  root.style.setProperty('--color-text', palette.colors.text);
  root.style.setProperty('--color-text-muted', palette.colors.textMuted);
  root.style.setProperty('--color-accent', palette.colors.accent);
  root.style.setProperty('--color-accent-secondary', palette.colors.accentSecondary);
  root.style.setProperty('--color-success', palette.colors.success);
  root.style.setProperty('--color-warning', palette.colors.warning);
  root.style.setProperty('--color-danger', palette.colors.danger);
}

export function useTheme() {
  const { user } = useAuth();
  const [paletteId, setPaletteId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PALETTE_ID;
  });

  // Apply palette whenever it changes
  useEffect(() => {
    applyPalette(getPalette(paletteId));
  }, [paletteId]);

  // Load palette from Supabase on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('theme_palette')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.theme_palette) {
          setPaletteId(data.theme_palette);
          localStorage.setItem(STORAGE_KEY, data.theme_palette);
        }
      });
  }, [user]);

  const setTheme = useCallback(async (id: string) => {
    setPaletteId(id);
    localStorage.setItem(STORAGE_KEY, id);
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_palette: id })
        .eq('id', user.id);
    }
  }, [user]);

  return {
    paletteId,
    palette: getPalette(paletteId),
    palettes: PALETTES,
    setTheme,
  };
}
```

- [ ] **Step 2: Wire useTheme into App.tsx**

Replace `packages/web/src/App.tsx` with:

```typescript
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { router } from './router';
import { useTheme } from './hooks/useTheme';

function ThemeLoader({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeLoader>
        <RouterProvider router={router} />
      </ThemeLoader>
    </AuthProvider>
  );
}
```

Note: `ThemeLoader` must be inside `AuthProvider` because `useTheme` calls `useAuth`. But `RouterProvider` doesn't render children — it renders its own routes. So `ThemeLoader` needs to be a sibling that just runs the hook. Adjust:

```typescript
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { router } from './router';
import { useTheme } from './hooks/useTheme';

function ThemeInitializer() {
  useTheme();
  return null;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeInitializer />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/hooks/useTheme.ts packages/web/src/App.tsx
git commit -m "feat: add useTheme hook and wire into App"
```

---

### Task 4: Database Migration

**Files:**
- Create: `supabase/migrations/008_add_theme_palette.sql`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/008_add_theme_palette.sql`:

```sql
-- Add theme palette preference to user profiles
ALTER TABLE profiles ADD COLUMN theme_palette text NOT NULL DEFAULT 'sunset-garden';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/008_add_theme_palette.sql
git commit -m "feat: add theme_palette column to profiles"
```

---

### Task 5: Update Core Components (PixelButton, PixelFrame)

**Files:**
- Modify: `packages/web/src/components/PixelButton.tsx`
- Modify: `packages/web/src/components/PixelFrame.tsx`

- [ ] **Step 1: Update PixelButton to use theme colors**

Replace the entire contents of `packages/web/src/components/PixelButton.tsx`:

```typescript
import { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, string> = {
  primary: 'bg-theme-accent text-theme-bg hover:brightness-110',
  secondary: 'bg-theme-surface text-theme-text-muted hover:brightness-125',
  danger: 'bg-theme-danger text-white hover:brightness-110',
};

const sizes: Record<string, string> = {
  sm: 'text-pixel-sm px-3 py-2',
  md: 'text-pixel-base px-5 py-3',
  lg: 'text-pixel-lg px-6 py-4',
};

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`font-pixel border-[3px] border-theme-border shadow-pixel-lg cursor-pointer
        active:shadow-pixel-pressed active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Update PixelFrame to use theme colors**

Replace the entire contents of `packages/web/src/components/PixelFrame.tsx`:

```typescript
import { ReactNode } from 'react';

export function PixelFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-theme-surface border-[3px] border-theme-border shadow-pixel-lg p-4 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify the app still compiles**

Run: `cd packages/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/PixelButton.tsx packages/web/src/components/PixelFrame.tsx
git commit -m "feat: update PixelButton and PixelFrame to use theme CSS vars"
```

---

### Task 6: Pixel Sprite System

**Files:**
- Create: `packages/shared/src/sprites.ts`
- Modify: `packages/shared/src/index.ts`
- Create: `packages/web/src/components/PixelSprite.tsx`

- [ ] **Step 1: Create sprite data structure and starter sprites**

Create `packages/shared/src/sprites.ts`:

```typescript
export interface SpriteDefinition {
  id: number;
  name: string;
  width: number;
  height: number;
  pixelSize: number;
  pixels: string; // CSS box-shadow value
}

// Helper: build box-shadow string from a pixel grid
// Each row is a string of hex colors separated by spaces, '.' for transparent
function buildSprite(
  id: number,
  name: string,
  width: number,
  height: number,
  pixelSize: number,
  grid: string[][]
): SpriteDefinition {
  const shadows: string[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const color = grid[y][x];
      if (color !== '.') {
        shadows.push(`${x * pixelSize}px ${y * pixelSize}px 0 ${color}`);
      }
    }
  }
  return { id, name, width, height, pixelSize, pixels: shadows.join(',') };
}

const _ = '.'; // transparent alias

// ── Creature Sprites (32x16 grid, 2px per pixel) ──

export const CREATURE_SPRITES: SpriteDefinition[] = [
  // 1: Sproutling (Common, green frog-like)
  buildSprite(1, 'Sproutling', 16, 10, 2, [
    [_,_,_,_,'#78c850','#78c850',_,_,_,_,'#78c850','#78c850',_,_,_,_],
    [_,_,_,'#78c850','#a8e878','#222',_,'#78c850','#78c850',_,'#222','#a8e878','#78c850',_,_,_],
    [_,_,_,'#78c850','#a8e878','#a8e878','#a8e878','#a8e878','#a8e878','#a8e878','#a8e878','#a8e878','#78c850',_,_,_],
    [_,_,_,_,'#78c850','#78c850','#78c850','#f85888','#78c850','#78c850','#78c850',_,_,_,_,_],
    [_,_,_,_,_,'#78c850','#a8e878','#a8e878','#a8e878','#78c850',_,_,_,_,_,_],
    [_,_,'#78c850',_,'#78c850','#78c850','#78c850','#78c850','#78c850','#78c850','#78c850',_,'#78c850',_,_,_],
    [_,_,_,'#78c850',_,'#78c850',_,_,_,'#78c850',_,'#78c850',_,_,_,_],
  ]),

  // 2: Pebblesnap (Common, gray turtle-like)
  buildSprite(2, 'Pebblesnap', 16, 10, 2, [
    [_,_,_,_,_,'#a8a878','#a8a878','#a8a878','#a8a878',_,_,_,_,_,_,_],
    [_,_,_,_,'#a8a878','#c8c0a0','#c8c0a0','#c8c0a0','#c8c0a0','#a8a878',_,_,_,_,_,_],
    [_,_,_,'#a8a878','#c8c0a0','#a8a878','#c8c0a0','#a8a878','#c8c0a0','#c8c0a0','#a8a878',_,_,_,_,_],
    [_,_,'#888870','#a8a878','#c8c0a0','#c8c0a0','#c8c0a0','#c8c0a0','#c8c0a0','#a8a878','#888870',_,_,_,_,_],
    [_,'#888870','#222',_,'#a8a878','#a8a878','#a8a878','#a8a878','#a8a878',_,'#222','#888870',_,_,_,_],
    [_,_,'#888870',_,_,'#888870',_,_,_,'#888870',_,_,'#888870',_,_,_],
  ]),

  // 3: Flickerfly (Uncommon, blue butterfly)
  buildSprite(3, 'Flickerfly', 16, 10, 2, [
    [_,'#6890f0',_,_,_,_,_,_,_,_,_,_,_,_,'#6890f0',_],
    ['#6890f0','#88b0ff','#6890f0',_,_,_,_,_,_,_,_,_,'#6890f0','#88b0ff','#6890f0',_],
    ['#6890f0','#88b0ff','#88b0ff','#6890f0',_,_,_,_,_,_,_,'#6890f0','#88b0ff','#88b0ff','#6890f0',_],
    [_,'#6890f0','#88b0ff','#6890f0','#6890f0',_,'#333',_,'#333',_,'#6890f0','#6890f0','#88b0ff','#6890f0',_,_],
    [_,_,'#6890f0','#6890f0','#88b0ff','#6890f0','#6890f0','#6890f0','#6890f0','#6890f0','#88b0ff','#6890f0','#6890f0',_,_,_],
    [_,_,_,_,'#6890f0','#88b0ff','#88b0ff','#f85888','#88b0ff','#88b0ff','#6890f0',_,_,_,_,_],
    [_,_,_,_,_,'#6890f0','#6890f0','#6890f0','#6890f0','#6890f0',_,_,_,_,_,_],
    [_,_,_,_,_,_,'#6890f0',_,'#6890f0',_,_,_,_,_,_,_],
  ]),

  // 4: Emberfox (Uncommon, orange fox)
  buildSprite(4, 'Emberfox', 16, 10, 2, [
    [_,_,'#f0a050',_,_,_,_,_,_,_,_,_,_,'#f0a050',_,_],
    [_,'#f0a050','#f8c878',_,_,_,_,_,_,_,_,_,'#f8c878','#f0a050',_,_],
    [_,'#f0a050','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#f0a050',_,_],
    [_,_,'#f0a050','#f8c878','#222','#f8c878','#f8c878','#f8c878','#f8c878','#f8c878','#222','#f8c878','#f0a050',_,_,_],
    [_,_,'#f0a050','#f8c878','#f8c878','#f8c878','#f0a050','#333','#f0a050','#f8c878','#f8c878','#f8c878','#f0a050',_,_,_],
    [_,_,_,'#f0a050','#f0a050','#f0a050','#f0a050','#f0a050','#f0a050','#f0a050','#f0a050','#f0a050',_,_,_,_],
    [_,_,_,_,'#f0a050',_,_,_,_,_,_,'#f0a050',_,'#f0a050','#f8c878','#f0a050'],
    [_,_,_,_,'#f0a050',_,_,_,_,_,_,'#f0a050',_,_,'#f0a050',_],
  ]),

  // 5: Coralwing (Rare, blue-purple sea dragon)
  buildSprite(5, 'Coralwing', 16, 10, 2, [
    [_,_,_,_,_,_,'#6890f0','#6890f0','#6890f0',_,_,_,_,_,_,_],
    [_,_,_,_,_,'#6890f0','#88b0ff','#88b0ff','#88b0ff','#6890f0',_,_,_,_,_,_],
    [_,_,_,_,'#6890f0','#88b0ff','#222','#88b0ff','#222','#88b0ff','#6890f0',_,_,_,_,_],
    [_,'#b080f0',_,'#6890f0','#88b0ff','#88b0ff','#88b0ff','#f85888','#88b0ff','#88b0ff','#88b0ff','#6890f0',_,_,_,_],
    ['#b080f0','#d0a0ff','#b080f0','#6890f0','#6890f0','#88b0ff','#88b0ff','#88b0ff','#88b0ff','#6890f0','#6890f0','#6890f0','#6890f0','#6890f0',_,_],
    [_,'#b080f0',_,_,'#6890f0','#6890f0','#6890f0','#6890f0','#6890f0','#6890f0',_,_,'#6890f0','#88b0ff','#6890f0',_],
    [_,_,_,_,_,'#6890f0',_,_,_,'#6890f0',_,_,_,'#6890f0',_,_],
  ]),

  // 6: Glimmoth (Rare, purple moth)
  buildSprite(6, 'Glimmoth', 16, 10, 2, [
    [_,_,_,_,_,_,_,'#b080f0',_,_,_,_,_,_,_,_],
    [_,_,'#b080f0','#b080f0',_,_,'#b080f0','#d0a0ff','#b080f0',_,_,'#b080f0','#b080f0',_,_,_],
    [_,'#b080f0','#d0a0ff','#d0a0ff','#b080f0','#b080f0','#d0a0ff','#d0a0ff','#d0a0ff','#b080f0','#b080f0','#d0a0ff','#d0a0ff','#b080f0',_,_],
    ['#b080f0','#d0a0ff','#f8d030','#d0a0ff','#d0a0ff','#222','#d0a0ff','#d0a0ff','#d0a0ff','#222','#d0a0ff','#d0a0ff','#f8d030','#d0a0ff','#b080f0',_],
    [_,'#b080f0','#d0a0ff','#d0a0ff','#b080f0','#d0a0ff','#d0a0ff','#f85888','#d0a0ff','#d0a0ff','#b080f0','#d0a0ff','#d0a0ff','#b080f0',_,_],
    [_,_,'#b080f0','#b080f0',_,'#b080f0','#b080f0','#b080f0','#b080f0','#b080f0',_,'#b080f0','#b080f0',_,_,_],
    [_,_,_,_,_,_,'#b080f0',_,'#b080f0',_,_,_,_,_,_,_],
  ]),

  // 7: Solflare (Legendary, golden phoenix)
  buildSprite(7, 'Solflare', 16, 10, 2, [
    [_,_,_,_,_,_,'#f8d030','#f8d030','#f8d030',_,_,_,_,_,_,_],
    [_,_,_,_,_,'#f8d030','#ffe878','#ffe878','#ffe878','#f8d030',_,_,_,_,_,_],
    [_,_,_,_,'#f8d030','#ffe878','#222','#ffe878','#222','#ffe878','#f8d030',_,_,_,_,_],
    [_,_,_,'#f85888','#f8d030','#ffe878','#ffe878','#f85888','#ffe878','#ffe878','#f8d030','#f85888',_,_,_,_],
    [_,_,'#f85888','#f8d030','#f8d030','#f8d030','#f8d030','#f8d030','#f8d030','#f8d030','#f8d030','#f8d030','#f85888',_,_,_],
    [_,_,_,'#f8d030','#ffe878','#f8d030','#ffe878','#ffe878','#ffe878','#f8d030','#ffe878','#f8d030',_,_,_,_],
    [_,_,_,_,'#f8d030',_,'#f8d030',_,'#f8d030',_,'#f8d030',_,_,_,_,_],
  ]),

  // 8: Frostfang (Legendary, ice wolf)
  buildSprite(8, 'Frostfang', 16, 10, 2, [
    [_,_,'#a0d0e8',_,_,_,_,_,_,_,_,_,_,'#a0d0e8',_,_],
    [_,'#a0d0e8','#d0e8f8',_,_,_,_,_,_,_,_,_,'#d0e8f8','#a0d0e8',_,_],
    [_,'#a0d0e8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#a0d0e8',_,_],
    [_,_,'#a0d0e8','#d0e8f8','#222','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#d0e8f8','#222','#d0e8f8','#a0d0e8',_,_,_],
    [_,_,'#a0d0e8','#d0e8f8','#d0e8f8','#d0e8f8','#a0d0e8','#fff','#a0d0e8','#d0e8f8','#d0e8f8','#d0e8f8','#a0d0e8',_,_,_],
    [_,_,_,'#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8','#a0d0e8',_,_,_,_],
    [_,_,_,_,'#a0d0e8',_,_,_,_,_,_,'#a0d0e8',_,_,_,_],
    [_,_,_,_,'#a0d0e8',_,_,_,_,_,_,'#a0d0e8','#a0d0e8','#d0e8f8','#a0d0e8',_],
  ]),

  // 9: Rosepetal (Mythic, pink fairy dragon)
  buildSprite(9, 'Rosepetal', 16, 10, 2, [
    [_,_,_,_,_,_,'#f85888','#f85888',_,_,_,_,_,_,_,_],
    [_,_,_,_,_,'#f85888','#ff88a8','#ff88a8','#f85888',_,_,_,_,_,_,_],
    [_,_,_,_,'#f85888','#ff88a8','#222','#ff88a8','#222','#f85888',_,_,_,_,_,_],
    ['#f0b0b8','#f85888',_,'#f85888','#ff88a8','#ff88a8','#ff88a8','#ff88a8','#ff88a8','#ff88a8','#f85888',_,'#f85888','#f0b0b8',_,_],
    [_,'#f0b0b8','#f85888','#f85888','#ff88a8','#ff88a8','#f85888','#ff88a8','#f85888','#ff88a8','#ff88a8','#f85888','#f85888','#f0b0b8',_,_],
    [_,_,_,_,'#f85888','#f85888','#ff88a8','#f85888','#ff88a8','#f85888','#f85888',_,_,_,_,_],
    [_,_,_,_,_,'#f85888',_,_,_,'#f85888',_,_,_,_,_,_],
  ]),

  // 10: Voidmaw (Mythic, dark shadow beast)
  buildSprite(10, 'Voidmaw', 16, 10, 2, [
    [_,_,_,'#4a2060',_,_,_,_,_,_,_,_,'#4a2060',_,_,_],
    [_,_,'#4a2060','#6a3080',_,_,_,_,_,_,_,_,'#6a3080','#4a2060',_,_],
    [_,_,'#4a2060','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#4a2060',_,_],
    [_,_,_,'#4a2060','#f8d030','#6a3080','#6a3080','#6a3080','#6a3080','#6a3080','#f8d030','#4a2060',_,_,_,_],
    [_,_,_,'#4a2060','#6a3080','#6a3080','#f85888','#f85888','#f85888','#6a3080','#6a3080','#4a2060',_,_,_,_],
    [_,_,_,_,'#4a2060','#4a2060','#4a2060','#4a2060','#4a2060','#4a2060','#4a2060',_,_,_,_,_],
    [_,_,_,'#4a2060',_,_,_,_,_,_,_,'#4a2060',_,_,_,_],
    [_,_,'#4a2060',_,_,_,_,_,_,_,_,_,'#4a2060',_,_,_],
  ]),

  // 11: Bubblefin (Common, water blob)
  buildSprite(11, 'Bubblefin', 16, 10, 2, [
    [_,_,_,_,_,'#6890f0','#6890f0','#6890f0','#6890f0','#6890f0',_,_,_,_,_,_],
    [_,_,_,_,'#6890f0','#88b0ff','#88b0ff','#88b0ff','#88b0ff','#88b0ff','#6890f0',_,_,_,_,_],
    [_,_,_,'#6890f0','#88b0ff','#222','#88b0ff','#88b0ff','#88b0ff','#222','#88b0ff','#6890f0',_,_,_,_],
    [_,_,_,'#6890f0','#88b0ff','#88b0ff','#88b0ff','#6890f0','#88b0ff','#88b0ff','#88b0ff','#6890f0',_,_,_,_],
    [_,_,_,_,'#6890f0','#88b0ff','#88b0ff','#88b0ff','#88b0ff','#88b0ff','#6890f0',_,_,_,_,_],
    [_,_,_,_,_,'#6890f0','#6890f0','#6890f0','#6890f0','#6890f0',_,_,_,_,_,_],
    [_,_,_,_,'#6890f0',_,_,_,_,_,'#6890f0',_,_,_,_,_],
  ]),

  // 12: Thornback (Uncommon, green cactus creature)
  buildSprite(12, 'Thornback', 16, 10, 2, [
    [_,_,_,_,_,_,_,'#78c850',_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,'#78c850','#a8e878','#78c850',_,_,_,_,_,_,_],
    [_,_,'#78c850',_,_,'#78c850','#a8e878','#a8e878','#a8e878','#78c850',_,_,'#78c850',_,_,_],
    [_,'#78c850','#a8e878','#78c850','#78c850','#a8e878','#222','#a8e878','#222','#a8e878','#78c850','#78c850','#a8e878','#78c850',_,_],
    [_,_,'#78c850','#a8e878','#a8e878','#a8e878','#a8e878','#f85888','#a8e878','#a8e878','#a8e878','#a8e878','#78c850',_,_,_],
    [_,_,_,'#78c850','#78c850','#a8e878','#a8e878','#a8e878','#a8e878','#a8e878','#78c850','#78c850',_,_,_,_],
    [_,_,_,_,_,'#78c850','#78c850','#78c850','#78c850','#78c850',_,_,_,_,_,_],
    [_,_,_,_,_,'#78c850',_,_,_,'#78c850',_,_,_,_,_,_],
  ]),
];

// ── Egg Sprites (7x8 grid, 4px per pixel) ──

export const EGG_SPRITES: Record<number, SpriteDefinition> = {
  1: buildSprite(101, 'Common Egg', 7, 8, 4, [
    [_,_,'#c8c0a0','#c8c0a0','#c8c0a0',_,_],
    [_,'#c8c0a0','#d8d0b8','#d8d0b8','#c8c0a0','#c8c0a0',_],
    ['#c8c0a0','#d8d0b8','#e8e0d0','#d8d0b8','#d8d0b8','#c8c0a0','#c8c0a0'],
    ['#c8c0a0','#d8d0b8','#d8d0b8','#e8e0d0','#d8d0b8','#c8c0a0','#a8a090'],
    ['#c8c0a0','#d8d0b8','#d8d0b8','#d8d0b8','#c8c0a0','#a8a090','#a8a090'],
    ['#a8a090','#c8c0a0','#c8c0a0','#c8c0a0','#a8a090','#a8a090','#888078'],
    [_,'#a8a090','#a8a090','#a8a090','#888078','#888078',_],
    [_,_,'#888078','#888078','#888078',_,_],
  ]),
  2: buildSprite(102, 'Uncommon Egg', 7, 8, 4, [
    [_,_,'#78c850','#78c850','#78c850',_,_],
    [_,'#78c850','#a8e878','#a8e878','#78c850','#78c850',_],
    ['#78c850','#a8e878','#d8f8b8','#a8e878','#a8e878','#78c850','#78c850'],
    ['#78c850','#a8e878','#a8e878','#d8f8b8','#a8e878','#78c850','#5aa838'],
    ['#78c850','#a8e878','#a8e878','#a8e878','#78c850','#5aa838','#5aa838'],
    ['#5aa838','#78c850','#78c850','#78c850','#5aa838','#5aa838','#3a8828'],
    [_,'#5aa838','#5aa838','#5aa838','#3a8828','#3a8828',_],
    [_,_,'#3a8828','#3a8828','#3a8828',_,_],
  ]),
  3: buildSprite(103, 'Rare Egg', 7, 8, 4, [
    [_,_,'#6890f0','#6890f0','#6890f0',_,_],
    [_,'#6890f0','#88b0ff','#88b0ff','#6890f0','#6890f0',_],
    ['#6890f0','#88b0ff','#c0d8ff','#88b0ff','#88b0ff','#6890f0','#6890f0'],
    ['#6890f0','#88b0ff','#88b0ff','#c0d8ff','#88b0ff','#6890f0','#4870d0'],
    ['#6890f0','#88b0ff','#88b0ff','#88b0ff','#6890f0','#4870d0','#4870d0'],
    ['#4870d0','#6890f0','#6890f0','#6890f0','#4870d0','#4870d0','#3058b0'],
    [_,'#4870d0','#4870d0','#4870d0','#3058b0','#3058b0',_],
    [_,_,'#3058b0','#3058b0','#3058b0',_,_],
  ]),
  4: buildSprite(104, 'Legendary Egg', 7, 8, 4, [
    [_,_,'#f8d030','#f8d030','#f8d030',_,_],
    [_,'#f8d030','#ffe878','#ffe878','#f8d030','#f8d030',_],
    ['#f8d030','#ffe878','#fff8b0','#ffe878','#ffe878','#f8d030','#f8d030'],
    ['#f8d030','#ffe878','#ffe878','#fff8b0','#ffe878','#f8d030','#d8b020'],
    ['#f8d030','#ffe878','#ffe878','#ffe878','#f8d030','#d8b020','#d8b020'],
    ['#d8b020','#f8d030','#f8d030','#f8d030','#d8b020','#d8b020','#b89010'],
    [_,'#d8b020','#d8b020','#d8b020','#b89010','#b89010',_],
    [_,_,'#b89010','#b89010','#b89010',_,_],
  ]),
  5: buildSprite(105, 'Mythic Egg', 7, 8, 4, [
    [_,_,'#f85888','#f85888','#f85888',_,_],
    [_,'#f85888','#ff88a8','#ff88a8','#f85888','#f85888',_],
    ['#f85888','#ff88a8','#ffc0d0','#ff88a8','#ff88a8','#f85888','#f85888'],
    ['#f85888','#ff88a8','#ff88a8','#ffc0d0','#ff88a8','#f85888','#d83868'],
    ['#f85888','#ff88a8','#ff88a8','#ff88a8','#f85888','#d83868','#d83868'],
    ['#d83868','#f85888','#f85888','#f85888','#d83868','#d83868','#b82048'],
    [_,'#d83868','#d83868','#d83868','#b82048','#b82048',_],
    [_,_,'#b82048','#b82048','#b82048',_,_],
  ]),
};

export function getCreatureSprite(creatureId: number): SpriteDefinition | undefined {
  return CREATURE_SPRITES.find(s => s.id === creatureId);
}

export function getEggSprite(rarity: number): SpriteDefinition {
  return EGG_SPRITES[rarity] ?? EGG_SPRITES[1];
}
```

- [ ] **Step 2: Export sprites from shared index**

In `packages/shared/src/index.ts`, add:

```typescript
export * from './types';
export * from './constants';
export * from './rarity';
export * from './palettes';
export * from './sprites';
```

- [ ] **Step 3: Create PixelSprite component**

Create `packages/web/src/components/PixelSprite.tsx`:

```typescript
import type { SpriteDefinition } from '@hatchling/shared';

interface PixelSpriteProps {
  sprite: SpriteDefinition;
  scale?: number;
  className?: string;
}

export function PixelSprite({ sprite, scale = 1, className = '' }: PixelSpriteProps) {
  const px = sprite.pixelSize * scale;
  const w = sprite.width * px;
  const h = sprite.height * px;

  // Rescale the box-shadow values by the scale factor
  const scaledPixels = scale === 1
    ? sprite.pixels
    : sprite.pixels.replace(
        /(\d+)px/g,
        (_, num) => `${Number(num) * scale}px`
      );

  return (
    <div
      className={`relative ${className}`}
      style={{ width: w, height: h, imageRendering: 'pixelated' as const }}
    >
      <div
        style={{
          position: 'absolute',
          width: px,
          height: px,
          boxShadow: scaledPixels,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd packages/shared && npx tsc --noEmit && cd ../web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/sprites.ts packages/shared/src/index.ts packages/web/src/components/PixelSprite.tsx
git commit -m "feat: add pixel sprite system with 12 creatures and 5 egg types"
```

---

### Task 7: Update CreatureCard to Use Sprites

**Files:**
- Modify: `packages/web/src/components/CreatureCard.tsx`

- [ ] **Step 1: Replace CreatureCard with sprite-based version**

Replace the entire contents of `packages/web/src/components/CreatureCard.tsx`:

```typescript
import type { CreatureDef, Rarity } from '@hatchling/shared';
import { getCreatureSprite } from '@hatchling/shared';
import { RarityBadge } from './RarityBadge';
import { PixelSprite } from './PixelSprite';

interface CreatureCardProps {
  creature: CreatureDef;
  owned: boolean;
  count?: number;
  onClick?: () => void;
}

export function CreatureCard({ creature, owned, count = 0, onClick }: CreatureCardProps) {
  const sprite = getCreatureSprite(creature.id);

  return (
    <div
      onClick={onClick}
      className={`border-2 border-theme-border p-2 cursor-pointer transition-all hover:-translate-y-1
        ${owned ? 'bg-theme-surface shadow-pixel-md' : 'bg-theme-bg opacity-50 grayscale'}`}
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
          {sprite ? (
            <PixelSprite sprite={sprite} scale={1} />
          ) : (
            <div
              className="w-8 h-8 border border-theme-border flex items-center justify-center text-pixel-sm text-theme-text"
              style={{ imageRendering: 'pixelated' }}
            >
              {owned ? creature.name[0] : '?'}
            </div>
          )}
        </div>
        {count > 1 && (
          <span className="absolute top-0 right-0 text-pixel-xs bg-theme-border text-theme-text px-1 font-pixel">
            x{count}
          </span>
        )}
        {creature.safariOnly && owned && (
          <span className="absolute top-0 left-0 text-pixel-sm">🌿</span>
        )}
      </div>
      <div className="text-center mt-1">
        <div className="text-pixel-xs truncate">{owned ? creature.name : '???'}</div>
        <div className="mt-1">
          <RarityBadge rarity={creature.rarity as Rarity} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/CreatureCard.tsx
git commit -m "feat: update CreatureCard to use pixel sprites and theme colors"
```

---

### Task 8: Update EggCard to Use Sprites

**Files:**
- Modify: `packages/web/src/components/EggCard.tsx`

- [ ] **Step 1: Read current EggCard.tsx to understand its structure**

Read `packages/web/src/components/EggCard.tsx` first to understand the current props and layout.

- [ ] **Step 2: Update EggCard to use PixelSprite and theme colors**

In the existing EggCard component, make these changes:
- Add import: `import { getEggSprite } from '@hatchling/shared';`
- Add import: `import { PixelSprite } from './PixelSprite';`
- Replace any hardcoded color classes (`bg-[#xxx]`, `border-[#333]`, `text-[#xxx]`) with theme equivalents:
  - `border-[#333]` → `border-theme-border`
  - `bg-white` or `bg-[#fff]` → `bg-theme-surface`
  - `text-[#333]` → `text-theme-text`
  - `text-[#888]` or `text-[#666]` → `text-theme-text-muted`
  - `bg-[#78c850]` → `bg-theme-success`
  - `shadow-[Npx_Npx_0_#333]` → `shadow-pixel-md` or `shadow-pixel-sm`
- Replace the colored egg box (if it uses a div with background color) with `<PixelSprite sprite={getEggSprite(egg.rarity)} />`
- Replace hardcoded text sizes like `text-[7px]`, `text-[8px]`, `text-[9px]` with `text-pixel-xs`, `text-pixel-sm`, `text-pixel-base`

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/EggCard.tsx
git commit -m "feat: update EggCard to use pixel sprites and theme colors"
```

---

### Task 9: Add Palette Selector to Settings Page

**Files:**
- Modify: `packages/web/src/pages/Settings.tsx`

- [ ] **Step 1: Read current Settings.tsx fully**

Read `packages/web/src/pages/Settings.tsx` to understand the complete current structure.

- [ ] **Step 2: Add palette selector and theme all hardcoded colors**

At the top of Settings.tsx, add these imports:

```typescript
import { PALETTES } from '@hatchling/shared';
import { useTheme } from '../hooks/useTheme';
```

Inside the Settings component function, add:

```typescript
const { paletteId, setTheme } = useTheme();
```

Add a new Theme section as the FIRST PixelFrame in the settings layout (before profile settings). Insert this JSX:

```tsx
<PixelFrame className="mb-6">
  <h3 className="font-pixel text-pixel-base text-theme-text mb-4">Theme</h3>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {PALETTES.map((p) => (
      <button
        key={p.id}
        onClick={() => setTheme(p.id)}
        className={`p-3 border-2 transition-all cursor-pointer ${
          paletteId === p.id
            ? 'border-theme-accent shadow-pixel-sm'
            : 'border-theme-border hover:border-theme-text-muted'
        }`}
        style={{ backgroundColor: p.colors.surface }}
      >
        <div className="flex gap-1 mb-2 justify-center">
          {[p.colors.bg, p.colors.surface, p.colors.accent, p.colors.accentSecondary, p.colors.text].map(
            (color, i) => (
              <div
                key={i}
                className="w-4 h-4 border border-black/20"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
        <div className="font-pixel text-pixel-xs text-center" style={{ color: p.colors.text }}>
          {p.name}
        </div>
      </button>
    ))}
  </div>
</PixelFrame>
```

Then replace all hardcoded colors throughout the rest of Settings.tsx:
- `border-[#333]` → `border-theme-border`
- `bg-white` → `bg-theme-surface`
- `text-[#333]` → `text-theme-text`
- `text-[#666]` or `text-[#888]` or `text-[#999]` → `text-theme-text-muted`
- `bg-[#78c850]` → `bg-theme-accent`
- `focus:border-[#78c850]` → `focus:border-theme-accent`
- `bg-[#f85888]` → `bg-theme-danger`
- `border-[#f85888]` → `border-theme-danger`
- `bg-[#e8e8e8]` → `bg-theme-bg`
- `shadow-[3px_3px_0_#333]` or `shadow-[4px_4px_0_#333]` → `shadow-pixel-md`
- Text sizes: `text-[7px]` → `text-pixel-xs`, `text-[8px]`/`text-[9px]` → `text-pixel-sm`, `text-[10px]`/`text-[11px]` → `text-pixel-base`, `text-[12px]`/`text-[14px]` → `text-pixel-lg`

- [ ] **Step 3: Verify the page renders**

Run: `cd packages/web && npx vite build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/pages/Settings.tsx
git commit -m "feat: add palette selector to Settings and theme all colors"
```

---

### Task 10: Theme All Remaining Pages

**Files:**
- Modify: `packages/web/src/pages/Dashboard.tsx`
- Modify: `packages/web/src/pages/GachaMachine.tsx`
- Modify: `packages/web/src/components/GachaPull.tsx`
- Modify: `packages/web/src/pages/Collection.tsx`
- Modify: `packages/web/src/pages/Store.tsx`
- Modify: `packages/web/src/pages/Stats.tsx`
- Modify: `packages/web/src/pages/Safari.tsx`
- Modify: `packages/web/src/pages/Landing.tsx`

For EACH file, apply the same color replacement pattern:

- [ ] **Step 1: Read and update Dashboard.tsx**

Read the file, then apply these replacements throughout:
- `bg-white` / `bg-[#fff]` → `bg-theme-surface`
- `bg-[#fefcd0]` → `bg-theme-bg`
- `border-[#333]` / `border-[3px] border-[#333]` → `border-theme-border` (keep `border-[3px]` width)
- `text-[#333]` → `text-theme-text`
- `text-[#666]` / `text-[#888]` / `text-[#999]` → `text-theme-text-muted`
- `bg-[#78c850]` → `bg-theme-success`
- `bg-[#6890f0]` → `bg-rarity-rare` (if it's rarity-related) or `bg-theme-accent` (if it's UI chrome)
- `bg-[#f85888]` → `bg-theme-danger`
- `bg-[#f8d030]` → `bg-theme-warning`
- `bg-[#e8f5d4]` or `bg-[#e8e8e8]` → `bg-theme-bg`
- `shadow-[3px_3px_0_#333]` → `shadow-pixel-md`
- `shadow-[4px_4px_0_#333]` → `shadow-pixel-lg`
- `shadow-[1px_1px_0_#333]` → `shadow-pixel-pressed`
- Text sizes: `text-[6px]`/`text-[7px]` → `text-pixel-xs`, `text-[8px]`/`text-[9px]` → `text-pixel-sm`, `text-[10px]`/`text-[11px]` → `text-pixel-base`, `text-[12px]`/`text-[14px]` → `text-pixel-lg`, `text-[16px]`/`text-[18px]` → `text-pixel-xl`
- Any inline `style={{ color: '#xxx' }}` should be converted to className equivalents where possible
- Replace `bg-black/50` (modal overlay) → keep as is (true black overlay is fine)

- [ ] **Step 2: Commit Dashboard**

```bash
git add packages/web/src/pages/Dashboard.tsx
git commit -m "feat: theme Dashboard page with CSS variables"
```

- [ ] **Step 3: Read and update GachaMachine.tsx and GachaPull.tsx**

Apply the same replacement pattern. For GachaPull.tsx specifically:
- The gacha machine SVG shapes and capsule colors use `RARITY_COLORS` — keep those as-is (they're game identity)
- Replace UI chrome colors (backgrounds, borders, text) with theme vars
- Replace any `#333` in className strings with theme equivalents

- [ ] **Step 4: Commit Gacha**

```bash
git add packages/web/src/pages/GachaMachine.tsx packages/web/src/components/GachaPull.tsx
git commit -m "feat: theme GachaMachine and GachaPull with CSS variables"
```

- [ ] **Step 5: Read and update Collection.tsx**

Apply the same replacement pattern.

- [ ] **Step 6: Commit Collection**

```bash
git add packages/web/src/pages/Collection.tsx
git commit -m "feat: theme Collection page with CSS variables"
```

- [ ] **Step 7: Read and update Store.tsx**

Apply the same replacement pattern. Store has category filter buttons with hardcoded colors — convert those to theme vars.

- [ ] **Step 8: Commit Store**

```bash
git add packages/web/src/pages/Store.tsx
git commit -m "feat: theme Store page with CSS variables"
```

- [ ] **Step 9: Read and update Stats.tsx**

Apply the same replacement pattern.

- [ ] **Step 10: Commit Stats**

```bash
git add packages/web/src/pages/Stats.tsx
git commit -m "feat: theme Stats page with CSS variables"
```

- [ ] **Step 11: Read and update Safari.tsx**

Apply the same replacement pattern.

- [ ] **Step 12: Commit Safari**

```bash
git add packages/web/src/pages/Safari.tsx
git commit -m "feat: theme Safari page with CSS variables"
```

- [ ] **Step 13: Read and update Landing.tsx**

Apply the same replacement pattern.

- [ ] **Step 14: Commit Landing**

```bash
git add packages/web/src/pages/Landing.tsx
git commit -m "feat: theme Landing page with CSS variables"
```

---

### Task 11: Theme the Navigation/Layout Components

**Files:**
- Check and modify: Any layout wrapper, sidebar, or nav component

- [ ] **Step 1: Find layout/nav components**

Run: `find packages/web/src -name '*.tsx' | xargs grep -l 'nav\|sidebar\|layout\|Nav\|Sidebar\|Layout'`

- [ ] **Step 2: Read and update each layout component**

Apply the same color replacement pattern to every layout/nav component found. Pay special attention to:
- Sidebar background (likely `bg-white` or `bg-[#fefcd0]`)
- Nav link active/hover states
- Border colors between sections

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ packages/web/src/pages/
git commit -m "feat: theme navigation and layout components"
```

---

### Task 12: Theme the Extension Popup

**Files:**
- Modify: `packages/extension/src/popup/Popup.tsx`

- [ ] **Step 1: Read current Popup.tsx**

Read `packages/extension/src/popup/Popup.tsx` fully.

- [ ] **Step 2: Add palette import and apply to inline styles**

The extension uses Preact with inline styles (no Tailwind). Strategy: import `getPalette` from shared, read palette ID from chrome.storage or hardcode default, and replace all inline color values.

At the top of Popup.tsx, add:

```typescript
import { getPalette, DEFAULT_PALETTE_ID } from '@hatchling/shared';
```

Add state for the palette:

```typescript
const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);

useEffect(() => {
  chrome.storage.local.get('hatchling_palette', (result) => {
    if (result.hatchling_palette) setPaletteId(result.hatchling_palette);
  });
}, []);

const theme = getPalette(paletteId).colors;
```

Then replace all inline color values:
- `'#333'` for borders → `theme.border`
- `'#78c850'` → `theme.success`
- `'#6890f0'` → `theme.accent` (for the primary action button)
- `'#e8e8e8'` → `theme.surface`
- `'#888'` / `'#666'` → `theme.textMuted`
- `'#fff'` / `'white'` background → `theme.surface`
- `fontFamily: 'monospace'` → `fontFamily: "'Press Start 2P', monospace"`
- `backgroundColor` on the root container → `theme.bg`
- `color` on the root container → `theme.text`
- `boxShadow: '3px 3px 0 #333'` → `boxShadow: \`3px 3px 0 ${theme.border}\``

Also update the embedded `rarityColors` map to use CSS vars from the shared package's `RARITY_COLORS` constant (already imported elsewhere, or add the import).

- [ ] **Step 3: Save palette ID to chrome.storage when web app changes it**

In `packages/web/src/hooks/useTheme.ts`, update the `setTheme` function to also broadcast to the extension. After the localStorage line, add:

```typescript
// Sync to extension if available
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.set({ hatchling_palette: id });
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/extension/src/popup/Popup.tsx packages/web/src/hooks/useTheme.ts
git commit -m "feat: theme extension popup with palette system"
```

---

### Task 13: Update Any Remaining Hardcoded Colors

**Files:**
- Any files still containing hardcoded color values

- [ ] **Step 1: Search for remaining hardcoded colors**

Run these searches to find any remaining hardcoded colors in component/page files:

```bash
grep -rn "#333\|#666\|#888\|#999\|#78c850\|#f85888\|#6890f0\|#f8d030\|#fefcd0\|bg-white\|#e8e8e8" packages/web/src/components/ packages/web/src/pages/ --include="*.tsx" --include="*.ts"
```

Exclude: `globals.css` (CSS vars are defined there), `sprites.ts` (sprite colors are intentional), any line that references rarity colors within game logic (not UI).

- [ ] **Step 2: Fix any remaining hardcoded colors**

For each file found, apply the same replacement pattern from Task 10.

- [ ] **Step 3: Also check for any `RarityBadge` component**

Read `packages/web/src/components/RarityBadge.tsx` and update it to use `text-rarity-*` / `bg-rarity-*` classes instead of inline rarity color styles, where the rarity colors are the CSS variable versions.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: replace all remaining hardcoded colors with theme variables"
```

---

### Task 14: Build Verification and Visual Testing

- [ ] **Step 1: Run TypeScript check**

Run: `cd packages/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run the build**

Run: `cd packages/web && npx vite build`
Expected: Build succeeds

- [ ] **Step 3: Start dev server and visually verify**

Run: `cd packages/web && npx vite dev`

Check in browser:
1. Dashboard loads with Sunset Garden palette (dark plum background)
2. Navigate to Settings — palette selector grid is visible at top
3. Click "Campfire" — entire app instantly switches to brown/amber palette
4. Click "Aurora" — switches to indigo/neon green
5. Refresh page — palette persists (localStorage)
6. Navigate to Collection — creature cards show pixel sprites (for IDs 1-12), letters for others
7. Navigate to Gacha Machine — UI chrome uses theme colors, rarity capsule colors stay fixed
8. Check egg cards on Dashboard — show pixel egg sprites with rarity colors

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual testing fixes for theme system"
```

---

### Task 15: Final Cleanup

- [ ] **Step 1: Remove the visual comparison HTML files**

```bash
rm docs/visual-comparison.html docs/palette-comparison.html
```

- [ ] **Step 2: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove visual comparison mockup files"
```
