# Hatchling — Delayed Gratification Game MVP

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome extension + web app that intercepts impulse purchases on major shopping sites, rewards restraint with gacha tokens, hatches collectible pixel creatures from eggs after a waiting period, and tracks savings.

**Architecture:** Chrome Extension (Manifest V3) handles shopping site detection, price scraping, and purchase interception. React web app serves as the game hub — gacha machine, creature collection, store, stats. Supabase provides auth, Postgres database, edge functions (gacha rarity logic), and file storage for assets. Extension and web app share a Supabase auth session.

**Tech Stack:**
- **Monorepo:** pnpm workspaces
- **Extension:** TypeScript, Chrome Extension Manifest V3, Preact (lightweight popup UI)
- **Web App:** Vite + React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, Postgres, Edge Functions, Storage)
- **Animations:** Framer Motion + CSS pixel art animations
- **Image Generation:** Canvas API for social share cards
- **Testing:** Vitest + React Testing Library + Playwright (E2E)

---

## File Structure

```
hatchling/
├── package.json                    # pnpm workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json              # shared TS config
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_users_and_settings.sql
│   │   ├── 002_creatures_and_eggs.sql
│   │   ├── 003_tokens_and_products.sql
│   │   ├── 004_store_and_safari.sql
│   │   └── 005_social_and_stats.sql
│   └── functions/
│       ├── gacha-pull/index.ts         # rarity calculation (server-side to prevent cheating)
│       ├── hatch-egg/index.ts          # egg hatching logic
│       └── generate-share-card/index.ts
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types.ts               # all shared TypeScript types
│   │   │   ├── constants.ts           # rarity tiers, incubation defaults, site configs
│   │   │   ├── rarity.ts              # rarity weight calculation
│   │   │   └── supabase-client.ts     # typed Supabase client factory
│   │   └── tsconfig.json
│   ├── extension/
│   │   ├── package.json
│   │   ├── manifest.json              # Manifest V3
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── background/
│   │   │   │   └── service-worker.ts  # background script: manages alarms, state
│   │   │   ├── content/
│   │   │   │   ├── detector.ts        # detects product pages & prices
│   │   │   │   ├── interceptor.ts     # intercepts add-to-cart / checkout
│   │   │   │   ├── overlay.ts         # renders the prompt overlay on shopping sites
│   │   │   │   └── sites/
│   │   │   │       ├── amazon.ts
│   │   │   │       ├── target.ts
│   │   │   │       ├── walmart.ts
│   │   │   │       ├── bestbuy.ts
│   │   │   │       ├── etsy.ts
│   │   │   │       ├── ebay.ts
│   │   │   │       ├── shopify.ts     # generic Shopify store detection
│   │   │   │       ├── wayfair.ts
│   │   │   │       ├── nike.ts
│   │   │   │       └── index.ts       # site registry & matcher
│   │   │   ├── popup/
│   │   │   │   ├── Popup.tsx          # extension popup (mini egg status, link to web app)
│   │   │   │   ├── index.tsx
│   │   │   │   └── popup.html
│   │   │   └── options/
│   │   │       ├── Options.tsx        # settings: threshold, whitelist, incubation period
│   │   │       ├── index.tsx
│   │   │       └── options.html
│   │   └── tests/
│   │       ├── detector.test.ts
│   │       ├── interceptor.test.ts
│   │       └── sites/
│   │           └── amazon.test.ts
│   └── web/
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       │   └── sprites/               # pixel art placeholder PNGs
│       │       ├── eggs/              # egg sprites per rarity (5 tiers)
│       │       ├── creatures/         # 100 creature sprites (32x32 pixel art)
│       │       └── ui/               # gacha machine, buttons, frames
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── router.tsx
│       │   ├── lib/
│       │   │   ├── supabase.ts        # Supabase client instance
│       │   │   └── auth.tsx           # AuthProvider context
│       │   ├── hooks/
│       │   │   ├── useCreatures.ts
│       │   │   ├── useEggs.ts
│       │   │   ├── useTokens.ts
│       │   │   ├── useSavings.ts
│       │   │   └── useStreak.ts
│       │   ├── pages/
│       │   │   ├── Landing.tsx        # marketing / login page
│       │   │   ├── Dashboard.tsx      # home: active eggs, savings summary, streak
│       │   │   ├── GachaMachine.tsx   # animated gacha pull experience
│       │   │   ├── Collection.tsx     # pokedex-style creature grid
│       │   │   ├── CreatureDetail.tsx # individual creature view + cosmetics
│       │   │   ├── Store.tsx          # cosmetic shop
│       │   │   ├── Safari.tsx         # safari encounter mini-game
│       │   │   ├── Stats.tsx          # savings summaries (weekly/monthly/annual)
│       │   │   └── Settings.tsx       # user settings (also accessible from extension)
│       │   ├── components/
│       │   │   ├── EggCard.tsx        # egg with incubation timer
│       │   │   ├── CreatureCard.tsx   # creature display with animations
│       │   │   ├── GachaPull.tsx      # gacha machine animation component
│       │   │   ├── RarityBadge.tsx
│       │   │   ├── SavingsCounter.tsx
│       │   │   ├── StreakCounter.tsx
│       │   │   ├── ShareCard.tsx      # generates shareable image
│       │   │   ├── PixelButton.tsx    # reusable retro button
│       │   │   ├── PixelFrame.tsx     # reusable retro frame/border
│       │   │   └── Layout.tsx         # app shell with nav
│       │   ├── styles/
│       │   │   ├── globals.css        # Tailwind + pixel font imports
│       │   │   └── pixel-theme.ts     # retro color palette, shadows, borders
│       │   └── data/
│       │       └── creatures.ts       # creature definitions (id, name, rarity, sprite path, description)
│       └── tests/
│           ├── GachaMachine.test.tsx
│           ├── Collection.test.tsx
│           └── EggCard.test.tsx
```

---

## Database Schema

```sql
-- 001_users_and_settings.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Trainer',
  spending_threshold INTEGER NOT NULL DEFAULT 5000, -- cents, default $50
  incubation_days INTEGER NOT NULL DEFAULT 14,
  cooldown_purchase_count INTEGER NOT NULL DEFAULT 3, -- trigger after N purchases in cooldown window
  cooldown_window_hours INTEGER NOT NULL DEFAULT 24,
  whitelisted_domains TEXT[] NOT NULL DEFAULT '{}',
  currency_balance INTEGER NOT NULL DEFAULT 0, -- virtual currency in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 002_creatures_and_eggs.sql
-- Rarity tiers: 1=Common, 2=Uncommon, 3=Rare, 4=Legendary, 5=Mythic
CREATE TABLE public.creature_defs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 5),
  sprite_path TEXT NOT NULL,
  description TEXT NOT NULL,
  safari_only BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.eggs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creature_id INTEGER NOT NULL REFERENCES public.creature_defs(id),
  rarity INTEGER NOT NULL,
  source_product_name TEXT NOT NULL,
  source_product_price INTEGER NOT NULL, -- cents
  source_product_keywords TEXT[] NOT NULL DEFAULT '{}',
  tracked_urls TEXT[] NOT NULL DEFAULT '{}',
  incubation_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  incubation_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'incubating' CHECK (status IN ('incubating', 'hatched', 'destroyed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creature_id INTEGER NOT NULL REFERENCES public.creature_defs(id),
  nickname TEXT,
  hatched_from_egg UUID REFERENCES public.eggs(id),
  found_via TEXT NOT NULL DEFAULT 'egg' CHECK (found_via IN ('egg', 'safari')),
  equipped_cosmetics JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 003_tokens_and_products.sql
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_product_name TEXT NOT NULL,
  source_product_price INTEGER NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  egg_id UUID NOT NULL REFERENCES public.eggs(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_keywords TEXT[] NOT NULL DEFAULT '{}',
  tracked_urls TEXT[] NOT NULL DEFAULT '{}',
  product_price INTEGER NOT NULL,
  tracking_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'violated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  amount_saved INTEGER NOT NULL, -- cents
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 004_store_and_safari.sql
CREATE TABLE public.cosmetic_defs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hat', 'accessory', 'background', 'effect')),
  sprite_path TEXT NOT NULL,
  price INTEGER NOT NULL, -- virtual currency in cents
  description TEXT NOT NULL
);

CREATE TABLE public.user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cosmetic_id INTEGER NOT NULL REFERENCES public.cosmetic_defs(id),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.safari_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3), -- 1=basic(3-streak), 2=mid(6-streak), 3=premium(10-streak)
  used BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 005_social_and_stats.sql
CREATE TABLE public.share_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 1: Foundation (Tasks 1-4)

### Task 1: Monorepo & Tooling Setup

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`
- Create: `packages/extension/package.json`, `packages/extension/tsconfig.json`, `packages/extension/vite.config.ts`
- Create: `packages/web/package.json`, `packages/web/tsconfig.json`, `packages/web/vite.config.ts`, `packages/web/index.html`

- [ ] **Step 1: Initialize git repo**

```bash
cd "/Users/lauragao/Documents/Mac Docs 2/delayed-gratification-game"
git init
```

- [ ] **Step 2: Create root package.json and workspace config**

```json
// package.json
{
  "name": "hatchling",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter @hatchling/web dev",
    "dev:ext": "pnpm --filter @hatchling/extension dev",
    "build:web": "pnpm --filter @hatchling/web build",
    "build:ext": "pnpm --filter @hatchling/extension build",
    "build:shared": "pnpm --filter @hatchling/shared build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "engines": { "node": ">=20" }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

- [ ] **Step 3: Create shared package with types and constants**

```typescript
// packages/shared/src/types.ts
export type Rarity = 1 | 2 | 3 | 4 | 5;
export const RARITY_NAMES: Record<Rarity, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Legendary',
  5: 'Mythic',
};

export interface CreatureDef {
  id: number;
  name: string;
  rarity: Rarity;
  spritePath: string;
  description: string;
  safariOnly: boolean;
}

export interface Egg {
  id: string;
  userId: string;
  creatureId: number;
  rarity: Rarity;
  sourceProductName: string;
  sourceProductPrice: number; // cents
  sourceProductKeywords: string[];
  trackedUrls: string[];
  incubationStart: string;
  incubationEnd: string;
  status: 'incubating' | 'hatched' | 'destroyed';
}

export interface Token {
  id: string;
  userId: string;
  sourceProductName: string;
  sourceProductPrice: number;
  used: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  spendingThreshold: number; // cents
  incubationDays: number;
  cooldownPurchaseCount: number;
  cooldownWindowHours: number;
  whitelistedDomains: string[];
  currencyBalance: number; // cents
}

export interface TrackedProduct {
  id: string;
  userId: string;
  eggId: string;
  productName: string;
  productKeywords: string[];
  trackedUrls: string[];
  productPrice: number;
  trackingUntil: string;
  status: 'active' | 'completed' | 'violated';
}

export interface UserCreature {
  id: string;
  userId: string;
  creatureId: number;
  nickname: string | null;
  hatchedFromEgg: string | null;
  foundVia: 'egg' | 'safari';
  equippedCosmetics: number[];
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  bestStreak: number;
  lastSuccessAt: string | null;
}

export interface SavingsStats {
  totalSaved: number;
  weekSaved: number;
  monthSaved: number;
  yearSaved: number;
  totalEggsHatched: number;
  totalEggsDestroyed: number;
  creaturesCollected: number;
  totalCreatures: number;
}

export interface SiteConfig {
  name: string;
  matchPatterns: string[]; // URL patterns for manifest.json
  hostPermissions: string[];
  detectProduct: (doc: Document) => { name: string; price: number; keywords: string[]; url: string } | null;
  detectAddToCart: (doc: Document) => HTMLElement | null;
  detectCheckout: (url: string) => boolean;
}
```

```typescript
// packages/shared/src/constants.ts
import { Rarity } from './types';

export const DEFAULT_THRESHOLD_CENTS = 5000; // $50
export const DEFAULT_INCUBATION_DAYS = 14;
export const DEFAULT_COOLDOWN_COUNT = 3;
export const DEFAULT_COOLDOWN_HOURS = 24;

export const RARITY_COLORS: Record<Rarity, string> = {
  1: '#a8a878', // Common - earthy
  2: '#78c850', // Uncommon - green
  3: '#6890f0', // Rare - blue
  4: '#f8d030', // Legendary - gold
  5: '#f85888', // Mythic - pink/magenta
};

export const SAFARI_STREAK_TIERS = {
  1: { requiredStreak: 3, label: 'Basic Safari Ticket' },
  2: { requiredStreak: 6, label: 'Premium Safari Ticket' },
  3: { requiredStreak: 10, label: 'Legendary Safari Expedition' },
} as const;

// Base weights - higher price tips toward rarer
export const BASE_RARITY_WEIGHTS: Record<Rarity, number> = {
  1: 50, // Common: 50%
  2: 25, // Uncommon: 25%
  3: 15, // Rare: 15%
  4: 8,  // Legendary: 8%
  5: 2,  // Mythic: 2%
};

export const WHITELISTED_DOMAINS_DEFAULTS = [
  'instacart.com',
  'doordash.com',
  'ubereats.com',
  'grubhub.com',
  'walgreens.com',
  'cvs.com',
  'costco.com',
  'kroger.com',
  'safeway.com',
  'wholefoodsmarket.com',
  'chewy.com',
];
```

```typescript
// packages/shared/src/rarity.ts
import { Rarity, BASE_RARITY_WEIGHTS } from './constants';

/**
 * Calculate rarity weights adjusted by product price.
 * Higher prices shift probability slightly toward rarer tiers.
 * Price bonus: every $100 above threshold adds +1 to Rare, +0.5 to Legendary, +0.2 to Mythic
 */
export function calculateRarityWeights(
  priceInCents: number,
  thresholdInCents: number
): Record<Rarity, number> {
  const priceAboveThreshold = Math.max(0, priceInCents - thresholdInCents);
  const hundreds = priceAboveThreshold / 10000; // each $100 unit

  const weights = { ...BASE_RARITY_WEIGHTS };
  weights[3] += hundreds * 1;    // Rare boost
  weights[4] += hundreds * 0.5;  // Legendary boost
  weights[5] += hundreds * 0.2;  // Mythic boost

  return weights;
}

export function pickRarity(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return Number(rarity) as Rarity;
  }
  return 1; // fallback
}
```

- [ ] **Step 4: Create tsconfig files**

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx"
  }
}
```

- [ ] **Step 5: Create .gitignore and .nvmrc**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

```
20
```

- [ ] **Step 6: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 7: Verify workspace builds**

```bash
pnpm build:shared
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: initialize monorepo with shared types and constants"
```

---

### Task 2: Supabase Setup & Database Migrations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/001_users_and_settings.sql` through `005_social_and_stats.sql`
- Create: `packages/shared/src/supabase-client.ts`

- [ ] **Step 1: Initialize Supabase project**

```bash
npx supabase init
```

- [ ] **Step 2: Create migration files**

Write each SQL migration file from the Database Schema section above. Each migration is one file.

- [ ] **Step 3: Add Row Level Security policies**

```sql
-- Add to each migration file after table creation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Same pattern for all user-scoped tables:
-- eggs, user_creatures, tokens, tracked_products, savings_log, user_cosmetics, streaks, safari_tickets
-- Policy: FOR ALL USING (auth.uid() = user_id)

-- creature_defs and cosmetic_defs are read-only for all authenticated users
ALTER TABLE public.creature_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read creatures" ON public.creature_defs FOR SELECT USING (true);

ALTER TABLE public.cosmetic_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cosmetics" ON public.cosmetic_defs FOR SELECT USING (true);

-- share_profiles: owner can write, public can read if is_public
ALTER TABLE public.share_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage share profile" ON public.share_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read public profiles" ON public.share_profiles FOR SELECT USING (is_public = true);
```

- [ ] **Step 4: Create auto-profile trigger**

```sql
-- In 001_users_and_settings.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Trainer'));

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  INSERT INTO public.share_profiles (user_id, share_slug)
  VALUES (NEW.id, encode(gen_random_bytes(8), 'hex'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 5: Create typed Supabase client**

```typescript
// packages/shared/src/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey);
}
```

- [ ] **Step 6: Start local Supabase and run migrations**

```bash
npx supabase start
npx supabase db reset
```

- [ ] **Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with RLS policies"
```

---

### Task 3: Supabase Edge Functions (Gacha Pull & Egg Hatch)

**Files:**
- Create: `supabase/functions/gacha-pull/index.ts`
- Create: `supabase/functions/hatch-egg/index.ts`

- [ ] **Step 1: Write gacha-pull edge function**

```typescript
// supabase/functions/gacha-pull/index.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  const { tokenId } = await req.json();

  // Verify token belongs to user and is unused
  const { data: token, error: tokenError } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', tokenId)
    .eq('user_id', user.id)
    .eq('used', false)
    .single();

  if (tokenError || !token) {
    return new Response(JSON.stringify({ error: 'Invalid or used token' }), { status: 400 });
  }

  // Get user profile for threshold
  const { data: profile } = await supabase
    .from('profiles')
    .select('spending_threshold, incubation_days')
    .eq('id', user.id)
    .single();

  // Calculate rarity weights based on product price vs threshold
  const priceAboveThreshold = Math.max(0, token.source_product_price - (profile?.spending_threshold ?? 5000));
  const hundreds = priceAboveThreshold / 10000;

  const weights = {
    1: 50,           // Common
    2: 25,           // Uncommon
    3: 15 + hundreds * 1,    // Rare
    4: 8 + hundreds * 0.5,   // Legendary
    5: 2 + hundreds * 0.2,   // Mythic
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let rarity = 1;
  for (const [r, w] of Object.entries(weights)) {
    roll -= w;
    if (roll <= 0) { rarity = Number(r); break; }
  }

  // Pick a random non-safari creature of this rarity
  const { data: creatures } = await supabase
    .from('creature_defs')
    .select('id')
    .eq('rarity', rarity)
    .eq('safari_only', false);

  if (!creatures || creatures.length === 0) {
    return new Response(JSON.stringify({ error: 'No creatures available' }), { status: 500 });
  }

  const creature = creatures[Math.floor(Math.random() * creatures.length)];
  const incubationDays = profile?.incubation_days ?? 14;
  const incubationEnd = new Date();
  incubationEnd.setDate(incubationEnd.getDate() + incubationDays);

  // Create egg
  const { data: egg, error: eggError } = await supabase
    .from('eggs')
    .insert({
      user_id: user.id,
      creature_id: creature.id,
      rarity,
      source_product_name: token.source_product_name,
      source_product_price: token.source_product_price,
      source_product_keywords: [], // populated by extension
      tracked_urls: [],
      incubation_end: incubationEnd.toISOString(),
    })
    .select()
    .single();

  if (eggError) {
    return new Response(JSON.stringify({ error: 'Failed to create egg' }), { status: 500 });
  }

  // Mark token as used
  await supabase.from('tokens').update({ used: true }).eq('id', tokenId);

  // Create tracked product
  await supabase.from('tracked_products').insert({
    user_id: user.id,
    egg_id: egg.id,
    product_name: token.source_product_name,
    product_keywords: [],
    tracked_urls: [],
    product_price: token.source_product_price,
    tracking_until: incubationEnd.toISOString(),
  });

  return new Response(JSON.stringify({
    egg: { id: egg.id, rarity, incubationEnd: incubationEnd.toISOString() },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 2: Write hatch-egg edge function**

```typescript
// supabase/functions/hatch-egg/index.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  const { eggId } = await req.json();

  // Get egg
  const { data: egg } = await supabase
    .from('eggs')
    .select('*')
    .eq('id', eggId)
    .eq('user_id', user.id)
    .eq('status', 'incubating')
    .single();

  if (!egg) {
    return new Response(JSON.stringify({ error: 'Egg not found or not incubating' }), { status: 400 });
  }

  // Check incubation complete
  if (new Date(egg.incubation_end) > new Date()) {
    return new Response(JSON.stringify({ error: 'Egg is still incubating' }), { status: 400 });
  }

  // Check tracked product not violated
  const { data: trackedProduct } = await supabase
    .from('tracked_products')
    .select('status')
    .eq('egg_id', eggId)
    .single();

  if (trackedProduct?.status === 'violated') {
    return new Response(JSON.stringify({ error: 'Product was purchased, egg destroyed' }), { status: 400 });
  }

  // Hatch the egg
  await supabase.from('eggs').update({ status: 'hatched' }).eq('id', eggId);

  // Add creature to collection
  const { data: creature } = await supabase
    .from('user_creatures')
    .insert({
      user_id: user.id,
      creature_id: egg.creature_id,
      hatched_from_egg: eggId,
      found_via: 'egg',
    })
    .select('*, creature_defs(*)')
    .single();

  // Mark tracked product complete
  await supabase
    .from('tracked_products')
    .update({ status: 'completed' })
    .eq('egg_id', eggId);

  // Add savings to log and virtual currency
  await supabase.from('savings_log').insert({
    user_id: user.id,
    product_name: egg.source_product_name,
    amount_saved: egg.source_product_price,
  });

  await supabase.rpc('increment_currency', {
    user_id_input: user.id,
    amount: egg.source_product_price,
  });

  // Update streak
  await supabase.rpc('increment_streak', { user_id_input: user.id });

  return new Response(JSON.stringify({ creature }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 3: Add RPC functions for currency and streak**

```sql
-- Add to migration 003
CREATE OR REPLACE FUNCTION increment_currency(user_id_input UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET currency_balance = currency_balance + amount, updated_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_streak(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.streaks
  SET
    current_streak = current_streak + 1,
    best_streak = GREATEST(best_streak, current_streak + 1),
    last_success_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION break_streak(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.streaks
  SET current_streak = 0, updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 4: Deploy and test edge functions locally**

```bash
npx supabase functions serve
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add gacha-pull and hatch-egg edge functions"
```

---

## Phase 2: Chrome Extension (Tasks 4-7)

### Task 4: Extension Scaffold & Manifest

**Files:**
- Create: `packages/extension/manifest.json`
- Create: `packages/extension/src/background/service-worker.ts`
- Create: `packages/extension/vite.config.ts`

- [ ] **Step 1: Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Hatchling - Delay & Collect",
  "version": "0.1.0",
  "description": "Turn impulse purchases into collectible creatures",
  "permissions": [
    "storage",
    "alarms",
    "activeTab",
    "tabs"
  ],
  "host_permissions": [
    "*://*.amazon.com/*",
    "*://*.amazon.co.uk/*",
    "*://*.target.com/*",
    "*://*.walmart.com/*",
    "*://*.bestbuy.com/*",
    "*://*.etsy.com/*",
    "*://*.ebay.com/*",
    "*://*.wayfair.com/*",
    "*://*.nike.com/*",
    "*://*.myshopify.com/*",
    "*://*.shopify.com/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.amazon.com/*",
        "*://*.target.com/*",
        "*://*.walmart.com/*",
        "*://*.bestbuy.com/*",
        "*://*.etsy.com/*",
        "*://*.ebay.com/*",
        "*://*.wayfair.com/*",
        "*://*.nike.com/*"
      ],
      "js": ["src/content/main.js"],
      "css": ["src/content/overlay.css"]
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "options_page": "src/options/options.html",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

- [ ] **Step 2: Create background service worker**

```typescript
// packages/extension/src/background/service-worker.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '__SUPABASE_URL__'; // replaced at build time
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_PRODUCT') {
    handleCheckProduct(message.payload).then(sendResponse);
    return true; // async response
  }

  if (message.type === 'DELAY_PURCHASE') {
    handleDelayPurchase(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'CHECK_TRACKED') {
    handleCheckTracked(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'PURCHASE_DETECTED') {
    handlePurchaseDetected(message.payload).then(sendResponse);
    return true;
  }
});

async function handleCheckProduct(payload: { price: number; url: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { action: 'none', reason: 'not_logged_in' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('spending_threshold, whitelisted_domains')
    .eq('id', session.user.id)
    .single();

  if (!profile) return { action: 'none' };

  // Check whitelist
  const url = new URL(payload.url);
  if (profile.whitelisted_domains.some((d: string) => url.hostname.includes(d))) {
    return { action: 'none', reason: 'whitelisted' };
  }

  // Check threshold
  if (payload.price < profile.spending_threshold) {
    return { action: 'none', reason: 'below_threshold' };
  }

  return { action: 'prompt', threshold: profile.spending_threshold };
}

async function handleDelayPurchase(payload: {
  productName: string;
  productPrice: number;
  productKeywords: string[];
  productUrl: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'not_logged_in' };

  // Create token
  const { data: token, error } = await supabase
    .from('tokens')
    .insert({
      user_id: session.user.id,
      source_product_name: payload.productName,
      source_product_price: payload.productPrice,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, token };
}

async function handleCheckTracked(payload: { url: string; keywords: string[] }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { tracked: false };

  const { data: products } = await supabase
    .from('tracked_products')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active');

  if (!products) return { tracked: false };

  for (const product of products) {
    // Check URL match
    if (product.tracked_urls.some((u: string) => payload.url.includes(u))) {
      return { tracked: true, product };
    }
    // Check keyword match
    const pageText = payload.keywords.join(' ').toLowerCase();
    const matchCount = product.product_keywords.filter(
      (kw: string) => pageText.includes(kw.toLowerCase())
    ).length;
    if (matchCount >= 2) { // at least 2 keyword matches
      return { tracked: true, product };
    }
  }

  return { tracked: false };
}

async function handlePurchaseDetected(payload: { productId: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Destroy the egg
  const { data: product } = await supabase
    .from('tracked_products')
    .select('egg_id')
    .eq('id', payload.productId)
    .single();

  if (product) {
    await supabase.from('eggs').update({ status: 'destroyed' }).eq('id', product.egg_id);
    await supabase.from('tracked_products').update({ status: 'violated' }).eq('id', payload.productId);
    await supabase.rpc('break_streak', { user_id_input: session.user.id });
  }
}

// Alarm to check for eggs ready to hatch
chrome.alarms.create('check-eggs', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'check-eggs') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: readyEggs } = await supabase
      .from('eggs')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('status', 'incubating')
      .lte('incubation_end', new Date().toISOString());

    if (readyEggs && readyEggs.length > 0) {
      chrome.action.setBadgeText({ text: `${readyEggs.length}` });
      chrome.action.setBadgeBackgroundColor({ color: '#f8d030' });
    }
  }
});
```

- [ ] **Step 3: Set up Vite build for extension**

```typescript
// packages/extension/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/main': resolve(__dirname, 'src/content/main.ts'),
        'popup/popup': resolve(__dirname, 'src/popup/popup.html'),
        'options/options': resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add packages/extension/
git commit -m "feat: scaffold Chrome extension with manifest and service worker"
```

---

### Task 5: Site-Specific Product Detectors

**Files:**
- Create: `packages/extension/src/content/sites/amazon.ts` (and all other site files)
- Create: `packages/extension/src/content/sites/index.ts`
- Test: `packages/extension/tests/sites/amazon.test.ts`

- [ ] **Step 1: Write failing test for Amazon detector**

```typescript
// packages/extension/tests/sites/amazon.test.ts
import { describe, it, expect } from 'vitest';
import { amazonConfig } from '../../src/content/sites/amazon';

describe('Amazon product detector', () => {
  it('detects product name and price from DOM', () => {
    document.body.innerHTML = `
      <span id="productTitle">Sony WH-1000XM5 Headphones</span>
      <span class="a-price-whole">348</span>
      <span class="a-price-fraction">00</span>
    `;
    const result = amazonConfig.detectProduct(document);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Sony WH-1000XM5 Headphones');
    expect(result!.price).toBe(34800); // cents
  });

  it('detects add-to-cart button', () => {
    document.body.innerHTML = `<input id="add-to-cart-button" type="submit" value="Add to Cart">`;
    const btn = amazonConfig.detectAddToCart(document);
    expect(btn).not.toBeNull();
  });

  it('detects checkout URL', () => {
    expect(amazonConfig.detectCheckout('https://www.amazon.com/gp/buy/spc/handlers/display.html')).toBe(true);
    expect(amazonConfig.detectCheckout('https://www.amazon.com/dp/B0C8XXX')).toBe(false);
  });

  it('returns null if no product found', () => {
    document.body.innerHTML = '<div>Not a product page</div>';
    const result = amazonConfig.detectProduct(document);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/extension && pnpm vitest run tests/sites/amazon.test.ts
```

- [ ] **Step 3: Implement Amazon detector**

```typescript
// packages/extension/src/content/sites/amazon.ts
import { SiteConfig } from '@hatchling/shared';

export const amazonConfig: SiteConfig = {
  name: 'Amazon',
  matchPatterns: ['*://*.amazon.com/*', '*://*.amazon.co.uk/*'],
  hostPermissions: ['*://*.amazon.com/*', '*://*.amazon.co.uk/*'],

  detectProduct(doc: Document) {
    const titleEl = doc.querySelector('#productTitle');
    const priceWhole = doc.querySelector('.a-price-whole');
    const priceFraction = doc.querySelector('.a-price-fraction');

    if (!titleEl || !priceWhole) return null;

    const name = titleEl.textContent?.trim() ?? '';
    const whole = parseInt(priceWhole.textContent?.replace(/[^0-9]/g, '') ?? '0', 10);
    const fraction = parseInt(priceFraction?.textContent?.replace(/[^0-9]/g, '') ?? '0', 10);
    const price = whole * 100 + fraction;

    if (!name || price === 0) return null;

    const keywords = name.split(/\s+/).filter(w => w.length > 3).map(w => w.toLowerCase());

    return { name, price, keywords, url: doc.location.href };
  },

  detectAddToCart(doc: Document) {
    return doc.querySelector('#add-to-cart-button') as HTMLElement | null;
  },

  detectCheckout(url: string) {
    return url.includes('/gp/buy/') || url.includes('/checkout/') || url.includes('/cart/proceed');
  },
};
```

- [ ] **Step 4: Run test, verify it passes**

- [ ] **Step 5: Implement remaining site detectors**

Each follows the same pattern. Key selectors per site:

| Site | Product Title Selector | Price Selector | Add to Cart Selector | Checkout URL Pattern |
|------|----------------------|----------------|---------------------|---------------------|
| Target | `h1[data-test="product-title"]` | `span[data-test="product-price"]` | `button[data-test="addToCartButton"]` | `/cart` or `/checkout` |
| Walmart | `h1[itemprop="name"]` | `span[itemprop="price"]` | `button[data-tl-id="ProductPrimaryCTA"]` | `/checkout` |
| Best Buy | `.sku-title h1` | `.priceView-customer-price span` | `.add-to-cart-button` | `/checkout` |
| Etsy | `h1[data-buy-box-listing-title]` | `p[class*="Price"] span` | `div[data-selector="add-to-cart"] button` | `/cart` |
| eBay | `.x-item-title__mainTitle span` | `.x-price-primary span` | `a#binBtn_btn` | `/rxo` or `/pay` |
| Wayfair | `.ProductDetailInfoBlock-header h1` | `div[class*="BasePriceBlock"] span` | `button[data-enzyme-id="PrimaryCTA"]` | `/checkout` |
| Nike | `h1#pdp_product_title` | `div[data-test="product-price"]` | `button[data-testid="add-to-cart-btn"]` | `/checkout` |
| Shopify (generic) | `.product__title, h1.product-single__title` | `.price__regular span, .product__price` | `button[name="add"], .product-form__submit` | `/checkout` |

- [ ] **Step 6: Create site registry**

```typescript
// packages/extension/src/content/sites/index.ts
import { SiteConfig } from '@hatchling/shared';
import { amazonConfig } from './amazon';
import { targetConfig } from './target';
import { walmartConfig } from './walmart';
import { bestbuyConfig } from './bestbuy';
import { etsyConfig } from './etsy';
import { ebayConfig } from './ebay';
import { wayfairConfig } from './wayfair';
import { nikeConfig } from './nike';
import { shopifyConfig } from './shopify';

export const SITE_CONFIGS: SiteConfig[] = [
  amazonConfig,
  targetConfig,
  walmartConfig,
  bestbuyConfig,
  etsyConfig,
  ebayConfig,
  wayfairConfig,
  nikeConfig,
  shopifyConfig,
];

export function getConfigForUrl(url: string): SiteConfig | null {
  for (const config of SITE_CONFIGS) {
    if (config.matchPatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    })) {
      return config;
    }
  }
  return null;
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/extension/src/content/sites/ packages/extension/tests/
git commit -m "feat: add product detectors for 9 shopping sites"
```

---

### Task 6: Content Script — Interceptor & Overlay UI

**Files:**
- Create: `packages/extension/src/content/detector.ts`
- Create: `packages/extension/src/content/interceptor.ts`
- Create: `packages/extension/src/content/overlay.ts`
- Create: `packages/extension/src/content/overlay.css`
- Create: `packages/extension/src/content/main.ts`

- [ ] **Step 1: Create the main content script entry point**

```typescript
// packages/extension/src/content/main.ts
import { getConfigForUrl } from './sites/index';
import { startDetection } from './detector';

const config = getConfigForUrl(window.location.href);
if (config) {
  startDetection(config);
}
```

- [ ] **Step 2: Create the detector**

```typescript
// packages/extension/src/content/detector.ts
import { SiteConfig } from '@hatchling/shared';
import { showInterceptOverlay, showTrackedWarning } from './overlay';

export function startDetection(config: SiteConfig) {
  // Check if this is a tracked product page
  checkIfTracked(config);

  // Detect product and price
  const product = config.detectProduct(document);
  if (!product) return;

  // Watch for add-to-cart clicks
  const addToCartBtn = config.detectAddToCart(document);
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async (e) => {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_PRODUCT',
        payload: { price: product.price, url: product.url },
      });

      if (response.action === 'prompt') {
        e.preventDefault();
        e.stopImmediatePropagation();
        showInterceptOverlay(product, config);
      }
    }, { capture: true });
  }

  // Also check if navigating to checkout
  if (config.detectCheckout(window.location.href)) {
    chrome.runtime.sendMessage({
      type: 'CHECK_PRODUCT',
      payload: { price: product.price, url: product.url },
    }).then(response => {
      if (response.action === 'prompt') {
        showInterceptOverlay(product, config);
      }
    });
  }
}

async function checkIfTracked(config: SiteConfig) {
  const product = config.detectProduct(document);
  if (!product) return;

  const response = await chrome.runtime.sendMessage({
    type: 'CHECK_TRACKED',
    payload: {
      url: window.location.href,
      keywords: product.keywords,
    },
  });

  if (response.tracked) {
    showTrackedWarning(response.product);
  }
}
```

- [ ] **Step 3: Create the overlay UI**

```typescript
// packages/extension/src/content/overlay.ts
import { SiteConfig } from '@hatchling/shared';

interface DetectedProduct {
  name: string;
  price: number;
  keywords: string[];
  url: string;
}

export function showInterceptOverlay(product: DetectedProduct, config: SiteConfig) {
  // Remove existing overlay if any
  document.getElementById('hatchling-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'hatchling-overlay';
  overlay.innerHTML = `
    <div class="hatchling-backdrop"></div>
    <div class="hatchling-modal">
      <div class="hatchling-modal-header">
        <img src="${chrome.runtime.getURL('icons/egg-pixel.png')}" class="hatchling-egg-icon" alt="egg" />
        <h2 class="hatchling-title">Hold on!</h2>
      </div>
      <p class="hatchling-body">
        Do you <em>really</em> need <strong>${escapeHtml(product.name)}</strong> for
        <strong>$${(product.price / 100).toFixed(2)}</strong>?
      </p>
      <p class="hatchling-subtitle">
        Or is this an impulse purchase? 🥚
      </p>
      <p class="hatchling-offer">
        Delay this purchase and receive a <strong>mystery egg token</strong>!
        Wait ${14} days and hatch a rare creature.
      </p>
      <div class="hatchling-buttons">
        <button class="hatchling-btn hatchling-btn-delay" id="hatchling-delay">
          🥚 Delay & Get Token!
        </button>
        <button class="hatchling-btn hatchling-btn-skip" id="hatchling-skip">
          I really need this
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('hatchling-delay')!.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'DELAY_PURCHASE',
      payload: {
        productName: product.name,
        productPrice: product.price,
        productKeywords: product.keywords,
        productUrl: product.url,
      },
    });

    if (response.success) {
      overlay.querySelector('.hatchling-modal')!.innerHTML = `
        <div class="hatchling-success">
          <h2 class="hatchling-title">Token earned! 🎉</h2>
          <p class="hatchling-body">
            You earned a gacha token worth <strong>$${(product.price / 100).toFixed(2)}</strong>!
          </p>
          <p class="hatchling-subtitle">
            Visit the Hatchling app to pull the gacha machine and start incubating your egg.
          </p>
          <button class="hatchling-btn hatchling-btn-delay" id="hatchling-open-app">
            Open Hatchling 🐣
          </button>
        </div>
      `;
      document.getElementById('hatchling-open-app')!.addEventListener('click', () => {
        window.open('__WEB_APP_URL__', '_blank');
        overlay.remove();
      });
    }
  });

  document.getElementById('hatchling-skip')!.addEventListener('click', () => {
    overlay.remove();
  });
}

export function showTrackedWarning(trackedProduct: { product_name: string; egg_id: string }) {
  const banner = document.createElement('div');
  banner.id = 'hatchling-warning';
  banner.innerHTML = `
    <div class="hatchling-warning-banner">
      <span class="hatchling-warning-icon">⚠️</span>
      <span class="hatchling-warning-text">
        You have an egg incubating for <strong>${escapeHtml(trackedProduct.product_name)}</strong>.
        Buying this will <strong>destroy your egg!</strong>
      </span>
      <button class="hatchling-warning-close" id="hatchling-dismiss-warning">✕</button>
    </div>
  `;
  document.body.prepend(banner);

  document.getElementById('hatchling-dismiss-warning')!.addEventListener('click', () => {
    banner.remove();
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

- [ ] **Step 4: Create overlay CSS with pixel/retro styling**

```css
/* packages/extension/src/content/overlay.css */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

#hatchling-overlay * {
  font-family: 'Press Start 2P', monospace !important;
  box-sizing: border-box;
}

.hatchling-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999998;
  animation: hatchling-fade-in 0.2s ease;
}

.hatchling-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999999;
  background: #fefcd0;
  border: 4px solid #333;
  box-shadow: 8px 8px 0 #333;
  padding: 32px;
  max-width: 480px;
  width: 90vw;
  image-rendering: pixelated;
  animation: hatchling-bounce-in 0.3s ease;
}

.hatchling-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.hatchling-egg-icon {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.hatchling-title {
  font-size: 18px;
  color: #333;
  margin: 0;
  text-shadow: 2px 2px 0 #ccc;
}

.hatchling-body {
  font-size: 10px;
  line-height: 1.8;
  color: #444;
  margin: 8px 0;
}

.hatchling-subtitle {
  font-size: 9px;
  color: #888;
  margin: 4px 0;
}

.hatchling-offer {
  font-size: 10px;
  color: #6a8a3e;
  background: #e8f5d4;
  border: 2px solid #6a8a3e;
  padding: 12px;
  margin: 16px 0;
}

.hatchling-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.hatchling-btn {
  font-size: 11px;
  padding: 14px 20px;
  border: 3px solid #333;
  box-shadow: 4px 4px 0 #333;
  cursor: pointer;
  transition: all 0.1s;
  text-align: center;
}

.hatchling-btn:active {
  box-shadow: 1px 1px 0 #333;
  transform: translate(3px, 3px);
}

.hatchling-btn-delay {
  background: #78c850;
  color: #fff;
  text-shadow: 1px 1px 0 #333;
}

.hatchling-btn-delay:hover {
  background: #8ad860;
}

.hatchling-btn-skip {
  background: #e8e8e8;
  color: #666;
}

.hatchling-btn-skip:hover {
  background: #d8d8d8;
}

/* Warning banner */
.hatchling-warning-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999997;
  background: #f85888;
  color: #fff;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  box-shadow: 0 4px 0 #c04060;
  animation: hatchling-slide-down 0.3s ease;
}

.hatchling-warning-icon { font-size: 16px; }

.hatchling-warning-text { flex: 1; line-height: 1.6; }

.hatchling-warning-close {
  background: none;
  border: 2px solid #fff;
  color: #fff;
  padding: 4px 8px;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
}

@keyframes hatchling-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes hatchling-bounce-in {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  60% { transform: translate(-50%, -50%) scale(1.05); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes hatchling-slide-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/extension/src/content/
git commit -m "feat: add purchase interceptor with retro pixel overlay UI"
```

---

### Task 7: Extension Popup & Options Pages

**Files:**
- Create: `packages/extension/src/popup/Popup.tsx`, `popup.html`, `index.tsx`
- Create: `packages/extension/src/options/Options.tsx`, `options.html`, `index.tsx`

- [ ] **Step 1: Create popup HTML shell**

```html
<!-- packages/extension/src/popup/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    body { width: 360px; min-height: 400px; margin: 0; font-family: 'Press Start 2P', monospace; background: #fefcd0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create Popup component**

```tsx
// packages/extension/src/popup/Popup.tsx
import { useState, useEffect } from 'preact/hooks';

export function Popup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eggs, setEggs] = useState<any[]>([]);
  const [tokens, setTokens] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    // Fetch state from background service worker
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (response) {
        setIsLoggedIn(response.isLoggedIn);
        setEggs(response.eggs || []);
        setTokens(response.tokenCount || 0);
        setSavings(response.totalSaved || 0);
      }
    });
  }, []);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>🐣 Hatchling</h2>
        <p style={{ fontSize: '8px', lineHeight: '1.8', marginBottom: '20px' }}>
          Log in to start collecting creatures!
        </p>
        <button
          onClick={() => window.open('__WEB_APP_URL__/login', '_blank')}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', padding: '12px 24px',
            background: '#78c850', color: '#fff', border: '3px solid #333',
            boxShadow: '4px 4px 0 #333', cursor: 'pointer',
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>🐣 Hatchling</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginBottom: '16px' }}>
        <div>🪙 {tokens} tokens</div>
        <div>💰 ${(savings / 100).toFixed(0)} saved</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '9px', marginBottom: '8px' }}>Active Eggs ({eggs.length})</h3>
        {eggs.length === 0 ? (
          <p style={{ fontSize: '7px', color: '#888' }}>No eggs incubating. Resist a purchase to earn a token!</p>
        ) : (
          eggs.map((egg: any) => {
            const remaining = Math.max(0, Math.ceil(
              (new Date(egg.incubation_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ));
            return (
              <div key={egg.id} style={{
                background: '#fff', border: '2px solid #333', padding: '8px',
                marginBottom: '6px', fontSize: '7px',
              }}>
                <div>🥚 {egg.source_product_name.substring(0, 30)}...</div>
                <div style={{ color: '#888' }}>{remaining} days remaining</div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => window.open('__WEB_APP_URL__', '_blank')}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', padding: '10px',
            background: '#6890f0', color: '#fff', border: '2px solid #333',
            boxShadow: '3px 3px 0 #333', cursor: 'pointer',
          }}
        >
          Open Hatchling App
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', padding: '8px',
            background: '#e8e8e8', color: '#666', border: '2px solid #333',
            cursor: 'pointer',
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Options page with onboarding settings**

The Options page should include:
- Spending threshold slider ($10–$500, default $50)
- Incubation period (7–30 days, default 14)
- Cooldown settings (purchase count + window)
- Whitelisted domains list (pre-populated with defaults, editable)
- Toggle for incognito reminder
- Login/logout

```tsx
// packages/extension/src/options/Options.tsx
// Full form with all settings above, saving to Supabase profiles table
// Uses same retro pixel styling
```

- [ ] **Step 4: Commit**

```bash
git add packages/extension/src/popup/ packages/extension/src/options/
git commit -m "feat: add extension popup and options pages"
```

---

## Phase 3: Web App (Tasks 8-15)

### Task 8: Web App Scaffold & Auth

**Files:**
- Create: `packages/web/src/main.tsx`, `App.tsx`, `router.tsx`
- Create: `packages/web/src/lib/supabase.ts`, `packages/web/src/lib/auth.tsx`
- Create: `packages/web/src/styles/globals.css`, `packages/web/src/styles/pixel-theme.ts`
- Create: `packages/web/src/components/Layout.tsx`, `PixelButton.tsx`, `PixelFrame.tsx`
- Create: `packages/web/src/pages/Landing.tsx`

- [ ] **Step 1: Set up Vite + React + Tailwind**

```bash
cd packages/web
pnpm add react react-dom react-router-dom @supabase/supabase-js framer-motion
pnpm add -D @types/react @types/react-dom tailwindcss postcss autoprefixer vite @vitejs/plugin-react vitest
npx tailwindcss init -p
```

- [ ] **Step 2: Create Supabase client and auth context**

```typescript
// packages/web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

```tsx
// packages/web/src/lib/auth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, session: null, loading: true, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Create pixel theme and global styles**

```css
/* packages/web/src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #fefcd0;
  --color-bg-dark: #e8e4b0;
  --color-border: #333;
  --color-text: #333;
  --color-text-muted: #888;
  --color-common: #a8a878;
  --color-uncommon: #78c850;
  --color-rare: #6890f0;
  --color-legendary: #f8d030;
  --color-mythic: #f85888;
  --color-success: #78c850;
  --color-danger: #f85888;
}

body {
  font-family: 'Press Start 2P', monospace;
  background-color: var(--color-bg);
  color: var(--color-text);
  image-rendering: pixelated;
}

* { box-sizing: border-box; }
```

```typescript
// packages/web/src/styles/pixel-theme.ts
export const pixelBorder = 'border-[3px] border-[#333] shadow-[4px_4px_0_#333]';
export const pixelBorderSm = 'border-2 border-[#333] shadow-[3px_3px_0_#333]';
export const pixelCard = `bg-white ${pixelBorder} p-4`;
export const rarityColors = {
  1: 'bg-[#a8a878]',
  2: 'bg-[#78c850]',
  3: 'bg-[#6890f0]',
  4: 'bg-[#f8d030]',
  5: 'bg-[#f85888]',
} as const;
```

- [ ] **Step 4: Create reusable pixel components**

```tsx
// packages/web/src/components/PixelButton.tsx
import { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-[#78c850] text-white hover:bg-[#8ad860]',
  secondary: 'bg-[#e8e8e8] text-[#666] hover:bg-[#d8d8d8]',
  danger: 'bg-[#f85888] text-white hover:bg-[#ff6898]',
};

const sizes = {
  sm: 'text-[8px] px-3 py-2',
  md: 'text-[10px] px-5 py-3',
  lg: 'text-[12px] px-6 py-4',
};

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`font-['Press_Start_2P'] border-[3px] border-[#333] shadow-[4px_4px_0_#333] cursor-pointer
        active:shadow-[1px_1px_0_#333] active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
```

```tsx
// packages/web/src/components/PixelFrame.tsx
import { ReactNode } from 'react';

export function PixelFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border-[3px] border-[#333] shadow-[4px_4px_0_#333] p-4 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Create Layout with navigation**

```tsx
// packages/web/src/components/Layout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { to: '/dashboard', label: '🏠 Home' },
  { to: '/gacha', label: '🎰 Gacha' },
  { to: '/collection', label: '📖 Collection' },
  { to: '/store', label: '🏪 Store' },
  { to: '/safari', label: '🌿 Safari' },
  { to: '/stats', label: '📊 Stats' },
];

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#333] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-[14px]">🐣 Hatchling</h1>
        <div className="flex items-center gap-4 text-[8px]">
          <span>{user?.email}</span>
          <button onClick={signOut} className="underline">Logout</button>
        </div>
      </header>

      <nav className="bg-[#444] px-4 py-2 flex gap-4 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-[9px] px-3 py-2 whitespace-nowrap ${
                isActive ? 'bg-[#fefcd0] text-[#333] border-2 border-[#333]' : 'text-[#ccc] hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="bg-[#333] text-[#888] text-[7px] text-center py-3">
        Hatchling — Turn impulse purchases into pixel friends
      </footer>
    </div>
  );
}
```

- [ ] **Step 6: Create router and Landing page**

```tsx
// packages/web/src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { GachaMachine } from './pages/GachaMachine';
import { Collection } from './pages/Collection';
import { CreatureDetail } from './pages/CreatureDetail';
import { Store } from './pages/Store';
import { Safari } from './pages/Safari';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <Layout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/gacha', element: <GachaMachine /> },
      { path: '/collection', element: <Collection /> },
      { path: '/collection/:id', element: <CreatureDetail /> },
      { path: '/store', element: <Store /> },
      { path: '/safari', element: <Safari /> },
      { path: '/stats', element: <Stats /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);
```

- [ ] **Step 7: Commit**

```bash
git add packages/web/
git commit -m "feat: scaffold web app with auth, routing, pixel theme, and layout"
```

---

### Task 9: Dashboard Page

**Files:**
- Create: `packages/web/src/pages/Dashboard.tsx`
- Create: `packages/web/src/hooks/useEggs.ts`, `useTokens.ts`, `useSavings.ts`, `useStreak.ts`
- Create: `packages/web/src/components/EggCard.tsx`, `SavingsCounter.tsx`, `StreakCounter.tsx`

- [ ] **Step 1: Create data hooks**

Each hook fetches from Supabase and returns reactive state. Example:

```typescript
// packages/web/src/hooks/useEggs.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Egg } from '@hatchling/shared';

export function useEggs() {
  const { user } = useAuth();
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchEggs() {
      const { data } = await supabase
        .from('eggs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'incubating')
        .order('incubation_end', { ascending: true });

      setEggs(data ?? []);
      setLoading(false);
    }

    fetchEggs();

    // Real-time subscription for egg updates
    const channel = supabase
      .channel('eggs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'eggs',
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchEggs(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { eggs, loading };
}
```

Same pattern for `useTokens`, `useSavings`, `useStreak`.

- [ ] **Step 2: Create EggCard component with countdown timer**

```tsx
// packages/web/src/components/EggCard.tsx
import { useEffect, useState } from 'react';
import { Egg } from '@hatchling/shared';
import { RARITY_NAMES } from '@hatchling/shared';
import { PixelFrame } from './PixelFrame';
import { rarityColors } from '../styles/pixel-theme';

export function EggCard({ egg, onHatch }: { egg: Egg; onHatch?: (eggId: string) => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      const end = new Date(egg.incubationEnd).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ready to hatch!');
        setReady(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [egg.incubationEnd]);

  const rarity = egg.rarity as 1 | 2 | 3 | 4 | 5;

  return (
    <PixelFrame className="flex flex-col items-center gap-3">
      <div className={`w-16 h-20 ${rarityColors[rarity]} border-2 border-[#333] flex items-center justify-center text-2xl`}>
        {ready ? '🐣' : '🥚'}
      </div>
      <div className="text-[8px] text-center">
        <div className="font-bold">{RARITY_NAMES[rarity]}</div>
        <div className="text-[7px] text-[#888] mt-1 truncate max-w-[140px]">
          {egg.sourceProductName}
        </div>
        <div className={`mt-2 ${ready ? 'text-[#78c850]' : 'text-[#666]'}`}>
          {timeLeft}
        </div>
      </div>
      {ready && onHatch && (
        <button
          onClick={() => onHatch(egg.id)}
          className="text-[8px] bg-[#f8d030] border-2 border-[#333] shadow-[3px_3px_0_#333] px-3 py-2 cursor-pointer
            active:shadow-[1px_1px_0_#333] active:translate-x-[2px] active:translate-y-[2px]"
        >
          Hatch! 🐣
        </button>
      )}
    </PixelFrame>
  );
}
```

- [ ] **Step 3: Create Dashboard page**

```tsx
// packages/web/src/pages/Dashboard.tsx
import { useEggs } from '../hooks/useEggs';
import { useTokens } from '../hooks/useTokens';
import { useSavings } from '../hooks/useSavings';
import { useStreak } from '../hooks/useStreak';
import { EggCard } from '../components/EggCard';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { eggs, loading: eggsLoading } = useEggs();
  const { unusedCount: tokenCount } = useTokens();
  const { totalSaved } = useSavings();
  const { currentStreak, bestStreak } = useStreak();
  const navigate = useNavigate();

  const handleHatch = async (eggId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hatch-egg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ eggId }),
    });
    const result = await res.json();
    if (result.creature) {
      navigate(`/collection/${result.creature.id}`);
    }
  };

  const readyEggs = eggs.filter(e => new Date(e.incubationEnd) <= new Date());
  const incubatingEggs = eggs.filter(e => new Date(e.incubationEnd) > new Date());

  return (
    <div className="space-y-6">
      <h2 className="text-[16px]">Welcome back, Trainer!</h2>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[18px]">🪙</div>
          <div className="text-[14px] font-bold mt-1">{tokenCount}</div>
          <div className="text-[7px] text-[#888] mt-1">Tokens</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">💰</div>
          <div className="text-[12px] font-bold mt-1">${(totalSaved / 100).toFixed(0)}</div>
          <div className="text-[7px] text-[#888] mt-1">Saved</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">🔥</div>
          <div className="text-[14px] font-bold mt-1">{currentStreak}</div>
          <div className="text-[7px] text-[#888] mt-1">Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">⭐</div>
          <div className="text-[14px] font-bold mt-1">{bestStreak}</div>
          <div className="text-[7px] text-[#888] mt-1">Best</div>
        </PixelFrame>
      </div>

      {/* Token CTA */}
      {tokenCount > 0 && (
        <PixelFrame className="text-center bg-[#e8f5d4]">
          <p className="text-[10px] mb-3">You have {tokenCount} unused token{tokenCount > 1 ? 's' : ''}!</p>
          <PixelButton onClick={() => navigate('/gacha')}>
            Pull the Gacha Machine! 🎰
          </PixelButton>
        </PixelFrame>
      )}

      {/* Ready to hatch */}
      {readyEggs.length > 0 && (
        <div>
          <h3 className="text-[11px] mb-3">🐣 Ready to Hatch!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {readyEggs.map(egg => (
              <EggCard key={egg.id} egg={egg} onHatch={handleHatch} />
            ))}
          </div>
        </div>
      )}

      {/* Incubating */}
      {incubatingEggs.length > 0 && (
        <div>
          <h3 className="text-[11px] mb-3">🥚 Incubating</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {incubatingEggs.map(egg => (
              <EggCard key={egg.id} egg={egg} />
            ))}
          </div>
        </div>
      )}

      {eggs.length === 0 && !eggsLoading && (
        <PixelFrame className="text-center">
          <p className="text-[10px] mb-2">No eggs yet!</p>
          <p className="text-[8px] text-[#888]">
            Install the browser extension and resist an impulse purchase to earn your first token.
          </p>
        </PixelFrame>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/
git commit -m "feat: add dashboard with egg cards, stats, and countdown timers"
```

---

### Task 10: Gacha Machine Page (Animated Pull)

**Files:**
- Create: `packages/web/src/pages/GachaMachine.tsx`
- Create: `packages/web/src/components/GachaPull.tsx`

This is the dopamine moment. The animation sequence:

1. User sees pixel art gacha machine with token count
2. User inserts token (click animation)
3. Machine shakes/rumbles (CSS animation)
4. Lever pulls down (sprite animation)
5. Capsule drops out — bounces at bottom
6. Dramatic pause with sparkle effects
7. Capsule opens — rarity color flash
8. Egg revealed with rarity announcement
9. Egg floats to "incubating" tray

- [ ] **Step 1: Create GachaPull animation component**

```tsx
// packages/web/src/components/GachaPull.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity, RARITY_NAMES } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';

type PullPhase = 'idle' | 'inserting' | 'shaking' | 'dropping' | 'revealing' | 'done';

interface PullResult {
  eggId: string;
  rarity: Rarity;
  incubationEnd: string;
}

export function GachaPull({ onPull, result, pulling }: {
  onPull: () => void;
  result: PullResult | null;
  pulling: boolean;
}) {
  const [phase, setPhase] = useState<PullPhase>('idle');

  const startPull = async () => {
    setPhase('inserting');
    setTimeout(() => setPhase('shaking'), 600);
    setTimeout(() => {
      onPull(); // triggers API call
      setPhase('dropping');
    }, 1500);
  };

  // When result arrives, advance to reveal
  if (result && phase === 'dropping') {
    setTimeout(() => setPhase('revealing'), 800);
    setTimeout(() => setPhase('done'), 2200);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Gacha Machine */}
      <motion.div
        className="relative w-64 h-80 bg-[#e44] border-4 border-[#333] shadow-[6px_6px_0_#333]"
        animate={phase === 'shaking' ? {
          x: [0, -4, 4, -4, 4, -2, 2, 0],
          transition: { duration: 0.8, repeat: 1 },
        } : {}}
      >
        {/* Machine top dome */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#e44] border-4 border-[#333] border-b-0 rounded-t-full" />

        {/* Glass window showing capsules */}
        <div className="absolute top-8 left-6 right-6 h-32 bg-[#333] border-2 border-[#555] overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2 justify-center">
            {[1,2,3,4,5,1,2,3,1,1,2,1].map((r, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border border-[#555]"
                style={{ backgroundColor: RARITY_COLORS[r as Rarity] }}
              />
            ))}
          </div>
        </div>

        {/* Coin slot */}
        <div className="absolute top-44 left-1/2 -translate-x-1/2">
          <div className="w-8 h-2 bg-[#333] border border-[#555]" />
          <AnimatePresence>
            {phase === 'inserting' && (
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#f8d030] rounded-full border-2 border-[#333] text-[8px] flex items-center justify-center"
                initial={{ y: -20, opacity: 1 }}
                animate={{ y: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                🪙
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dispensing slot */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-12 bg-[#222] border-2 border-[#555] rounded-b-lg" />
      </motion.div>

      {/* Dropped capsule */}
      <AnimatePresence>
        {(phase === 'dropping' || phase === 'revealing' || phase === 'done') && result && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              className="w-20 h-24 border-3 border-[#333] flex items-center justify-center text-3xl"
              style={{ backgroundColor: RARITY_COLORS[result.rarity] }}
              animate={phase === 'revealing' ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {phase === 'done' ? '🥚' : '❓'}
            </motion.div>

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div
                  className="text-[14px] font-bold"
                  style={{ color: RARITY_COLORS[result.rarity] }}
                >
                  {RARITY_NAMES[result.rarity]}!
                </div>
                <div className="text-[8px] text-[#888] mt-2">
                  Egg is now incubating...
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull button */}
      {phase === 'idle' && (
        <button
          onClick={startPull}
          disabled={pulling}
          className="text-[12px] font-['Press_Start_2P'] bg-[#f8d030] text-[#333] border-4 border-[#333]
            shadow-[6px_6px_0_#333] px-8 py-4 cursor-pointer
            active:shadow-[2px_2px_0_#333] active:translate-x-[4px] active:translate-y-[4px]
            hover:bg-[#ffe040] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Insert Token 🪙
        </button>
      )}

      {phase === 'done' && (
        <button
          onClick={() => setPhase('idle')}
          className="text-[10px] font-['Press_Start_2P'] bg-[#78c850] text-white border-3 border-[#333]
            shadow-[4px_4px_0_#333] px-6 py-3 cursor-pointer"
        >
          Pull Again?
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create GachaMachine page**

```tsx
// packages/web/src/pages/GachaMachine.tsx
import { useState } from 'react';
import { GachaPull } from '../components/GachaPull';
import { useTokens } from '../hooks/useTokens';
import { PixelFrame } from '../components/PixelFrame';
import { supabase } from '../lib/supabase';

export function GachaMachine() {
  const { tokens, unusedCount, refetch } = useTokens();
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const handlePull = async () => {
    if (!selectedToken) return;
    setPulling(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gacha-pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ tokenId: selectedToken }),
    });

    const data = await res.json();
    setResult(data.egg);
    setPulling(false);
    refetch();
  };

  const unusedTokens = tokens.filter(t => !t.used);

  return (
    <div className="space-y-6">
      <h2 className="text-[16px] text-center">🎰 Gacha Machine</h2>

      {unusedCount === 0 ? (
        <PixelFrame className="text-center">
          <p className="text-[10px]">No tokens available!</p>
          <p className="text-[8px] text-[#888] mt-2">
            Resist an impulse purchase to earn a token.
          </p>
        </PixelFrame>
      ) : (
        <>
          {/* Token selector */}
          <PixelFrame>
            <h3 className="text-[10px] mb-3">Select a token to use:</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {unusedTokens.map(token => (
                <label
                  key={token.id}
                  className={`flex items-center gap-3 p-2 cursor-pointer border-2 ${
                    selectedToken === token.id ? 'border-[#f8d030] bg-[#fff8d0]' : 'border-[#ddd]'
                  }`}
                >
                  <input
                    type="radio"
                    name="token"
                    checked={selectedToken === token.id}
                    onChange={() => setSelectedToken(token.id)}
                  />
                  <div>
                    <div className="text-[8px]">{token.sourceProductName}</div>
                    <div className="text-[7px] text-[#888]">${(token.sourceProductPrice / 100).toFixed(2)}</div>
                  </div>
                </label>
              ))}
            </div>
          </PixelFrame>

          <GachaPull onPull={handlePull} result={result} pulling={pulling} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/pages/GachaMachine.tsx packages/web/src/components/GachaPull.tsx
git commit -m "feat: add animated gacha machine with token selection and pull sequence"
```

---

### Task 11: Collection / Pokédex Page

**Files:**
- Create: `packages/web/src/pages/Collection.tsx`
- Create: `packages/web/src/pages/CreatureDetail.tsx`
- Create: `packages/web/src/hooks/useCreatures.ts`
- Create: `packages/web/src/components/CreatureCard.tsx`
- Create: `packages/web/src/components/RarityBadge.tsx`
- Create: `packages/web/src/data/creatures.ts`

- [ ] **Step 1: Create creature definitions data file**

```typescript
// packages/web/src/data/creatures.ts
import { CreatureDef } from '@hatchling/shared';

// 100 creatures: ~45 Common, ~25 Uncommon, ~15 Rare, ~10 Legendary, ~5 Mythic
// Plus ~10-15 safari-only creatures spread across rarities
export const CREATURES: CreatureDef[] = [
  // Common (1) - 45 creatures
  { id: 1, name: 'Pennypuff', rarity: 1, spritePath: '/sprites/creatures/001.png', description: 'A small fluffy creature that collects loose change.', safariOnly: false },
  { id: 2, name: 'Budgibee', rarity: 1, spritePath: '/sprites/creatures/002.png', description: 'A busy bee that buzzes around bargain bins.', safariOnly: false },
  { id: 3, name: 'Savelet', rarity: 1, spritePath: '/sprites/creatures/003.png', description: 'A tiny leaf sprite that grows when you save money.', safariOnly: false },
  // ... (all 100 creature definitions follow this pattern)
  // Each creature gets a thematic name related to saving, patience, or collecting

  // Uncommon (2) - 25 creatures
  { id: 46, name: 'Coinguard', rarity: 2, spritePath: '/sprites/creatures/046.png', description: 'A loyal guardian that protects your wallet.', safariOnly: false },

  // Rare (3) - 15 creatures
  { id: 71, name: 'Vaulthorn', rarity: 3, spritePath: '/sprites/creatures/071.png', description: 'A majestic creature with horns that lock away temptation.', safariOnly: false },

  // Legendary (4) - 10 creatures
  { id: 86, name: 'Restrainox', rarity: 4, spritePath: '/sprites/creatures/086.png', description: 'The embodiment of willpower, said to appear only to the most disciplined.', safariOnly: false },

  // Mythic (5) - 5 creatures (non-safari)
  { id: 96, name: 'Zenithrift', rarity: 5, spritePath: '/sprites/creatures/096.png', description: 'A celestial being that transcends the need for material possessions.', safariOnly: false },

  // Safari-only creatures (spread across rarities)
  { id: 101, name: 'Wildsave', rarity: 2, spritePath: '/sprites/creatures/101.png', description: 'A shy creature only found in the Savings Safari.', safariOnly: true },
  { id: 110, name: 'Mythifrugal', rarity: 5, spritePath: '/sprites/creatures/110.png', description: 'The rarest safari creature. Legends say it grants eternal financial wisdom.', safariOnly: true },
];

// Full 100+ creature list would be generated here
// For MVP, we define all names/descriptions and use placeholder sprites
```

Note: The actual file will contain all 100+ creature definitions. Each creature needs a unique name, description, rarity, and sprite path. We generate placeholder 32x32 pixel sprites (colored squares with simple faces) in Task 14.

- [ ] **Step 2: Create CreatureCard and RarityBadge components**

```tsx
// packages/web/src/components/RarityBadge.tsx
import { Rarity, RARITY_NAMES } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="text-[7px] px-2 py-1 border border-[#333] text-white font-bold"
      style={{ backgroundColor: RARITY_COLORS[rarity] }}
    >
      {RARITY_NAMES[rarity]}
    </span>
  );
}
```

```tsx
// packages/web/src/components/CreatureCard.tsx
import { CreatureDef, Rarity } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';
import { RarityBadge } from './RarityBadge';

interface CreatureCardProps {
  creature: CreatureDef;
  owned: boolean;
  count?: number;
  onClick?: () => void;
}

export function CreatureCard({ creature, owned, count = 0, onClick }: CreatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-2 border-[#333] p-2 cursor-pointer transition-all hover:-translate-y-1
        ${owned ? 'bg-white shadow-[3px_3px_0_#333]' : 'bg-[#ddd] opacity-60'}`}
    >
      <div className="relative">
        <img
          src={owned ? creature.spritePath : '/sprites/creatures/unknown.png'}
          alt={owned ? creature.name : '???'}
          className="w-16 h-16 mx-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        {count > 1 && (
          <span className="absolute top-0 right-0 text-[7px] bg-[#333] text-white px-1">
            x{count}
          </span>
        )}
      </div>
      <div className="text-center mt-2">
        <div className="text-[7px] truncate">{owned ? creature.name : '???'}</div>
        <div className="mt-1">
          <RarityBadge rarity={creature.rarity as Rarity} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Collection page (Pokédex grid)**

```tsx
// packages/web/src/pages/Collection.tsx
import { useState } from 'react';
import { useCreatures } from '../hooks/useCreatures';
import { CreatureCard } from '../components/CreatureCard';
import { CREATURES } from '../data/creatures';
import { Rarity, RARITY_NAMES } from '@hatchling/shared';
import { useNavigate } from 'react-router-dom';

export function Collection() {
  const { ownedCreatures } = useCreatures();
  const [filterRarity, setFilterRarity] = useState<Rarity | null>(null);
  const [showOwned, setShowOwned] = useState<'all' | 'owned' | 'missing'>('all');
  const navigate = useNavigate();

  const ownedIds = new Set(ownedCreatures.map(c => c.creatureId));
  const ownedCounts: Record<number, number> = {};
  ownedCreatures.forEach(c => {
    ownedCounts[c.creatureId] = (ownedCounts[c.creatureId] || 0) + 1;
  });

  let filtered = CREATURES;
  if (filterRarity) filtered = filtered.filter(c => c.rarity === filterRarity);
  if (showOwned === 'owned') filtered = filtered.filter(c => ownedIds.has(c.id));
  if (showOwned === 'missing') filtered = filtered.filter(c => !ownedIds.has(c.id));

  const totalOwned = new Set(ownedCreatures.map(c => c.creatureId)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px]">📖 Pokédex</h2>
        <div className="text-[10px]">{totalOwned} / {CREATURES.length}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-[#ddd] border-2 border-[#333]">
        <div
          className="h-full bg-[#78c850] transition-all"
          style={{ width: `${(totalOwned / CREATURES.length) * 100}%` }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRarity(null)}
          className={`text-[7px] px-2 py-1 border border-[#333] ${!filterRarity ? 'bg-[#333] text-white' : 'bg-white'}`}
        >
          All
        </button>
        {([1, 2, 3, 4, 5] as Rarity[]).map(r => (
          <button
            key={r}
            onClick={() => setFilterRarity(filterRarity === r ? null : r)}
            className={`text-[7px] px-2 py-1 border border-[#333] ${filterRarity === r ? 'bg-[#333] text-white' : 'bg-white'}`}
          >
            {RARITY_NAMES[r]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {filtered.map(creature => (
          <CreatureCard
            key={creature.id}
            creature={creature}
            owned={ownedIds.has(creature.id)}
            count={ownedCounts[creature.id]}
            onClick={() => ownedIds.has(creature.id) && navigate(`/collection/${creature.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create CreatureDetail page**

Shows individual creature with cosmetics equipped, stats, how it was obtained, option to nickname.

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/pages/Collection.tsx packages/web/src/pages/CreatureDetail.tsx packages/web/src/components/ packages/web/src/data/ packages/web/src/hooks/
git commit -m "feat: add pokedex collection with creature cards, rarity filters, and detail view"
```

---

### Task 12: Store Page

**Files:**
- Create: `packages/web/src/pages/Store.tsx`

- [ ] **Step 1: Create Store page with cosmetic items**

The store displays cosmetic items grouped by category (hat, accessory, background, effect). Each item shows its price in virtual currency. User can purchase if they have enough balance. Items are applied in CreatureDetail page.

Categories:
- Hats: pixel top hat, crown, party hat, cowboy hat, etc.
- Accessories: pixel sunglasses, scarf, bow tie, cape, etc.
- Backgrounds: pixel meadow, starry sky, ocean, forest, etc.
- Effects: sparkles, hearts, fire, bubbles, etc.

~20 cosmetic items for V1.

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/Store.tsx
git commit -m "feat: add virtual store with cosmetic items"
```

---

### Task 13: Safari Page

**Files:**
- Create: `packages/web/src/pages/Safari.tsx`

- [ ] **Step 1: Create Safari encounter mini-game**

The safari is a simple encounter system:
1. User spends a safari ticket (earned from streaks)
2. A random safari-only creature appears based on ticket tier:
   - Basic (3-streak): Common/Uncommon safari creatures
   - Premium (6-streak): Uncommon/Rare safari creatures
   - Legendary (10-streak): Rare/Legendary/Mythic safari creatures
3. User has 3 "lure" attempts — pick a food item, creature has hidden preference
4. If correct food is chosen, creature is caught. If all 3 fail, it escapes.
5. Simple text-based encounter with pixel art creature animation (approach/flee)

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/Safari.tsx
git commit -m "feat: add safari encounter mini-game"
```

---

### Task 14: Stats Page & Share Card

**Files:**
- Create: `packages/web/src/pages/Stats.tsx`
- Create: `packages/web/src/components/ShareCard.tsx`
- Create: `packages/web/src/components/SavingsCounter.tsx`

- [ ] **Step 1: Create Stats page with weekly/monthly/annual savings**

```tsx
// packages/web/src/pages/Stats.tsx
import { useSavings } from '../hooks/useSavings';
import { useCreatures } from '../hooks/useCreatures';
import { useStreak } from '../hooks/useStreak';
import { PixelFrame } from '../components/PixelFrame';
import { ShareCard } from '../components/ShareCard';
import { CREATURES } from '../data/creatures';

export function Stats() {
  const { totalSaved, weekSaved, monthSaved, yearSaved, savingsLog } = useSavings();
  const { ownedCreatures } = useCreatures();
  const { currentStreak, bestStreak } = useStreak();

  const uniqueOwned = new Set(ownedCreatures.map(c => c.creatureId)).size;

  return (
    <div className="space-y-6">
      <h2 className="text-[16px]">📊 Your Stats</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[7px] text-[#888]">This Week</div>
          <div className="text-[16px] font-bold text-[#78c850] mt-2">${(weekSaved / 100).toFixed(0)}</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[7px] text-[#888]">This Month</div>
          <div className="text-[16px] font-bold text-[#78c850] mt-2">${(monthSaved / 100).toFixed(0)}</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[7px] text-[#888]">This Year</div>
          <div className="text-[16px] font-bold text-[#78c850] mt-2">${(yearSaved / 100).toFixed(0)}</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[7px] text-[#888]">All Time</div>
          <div className="text-[16px] font-bold text-[#f8d030] mt-2">${(totalSaved / 100).toFixed(0)}</div>
        </PixelFrame>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[18px]">🔥</div>
          <div className="text-[14px] font-bold mt-1">{currentStreak}</div>
          <div className="text-[7px] text-[#888]">Current Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">⭐</div>
          <div className="text-[14px] font-bold mt-1">{bestStreak}</div>
          <div className="text-[7px] text-[#888]">Best Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">📖</div>
          <div className="text-[14px] font-bold mt-1">{uniqueOwned}/{CREATURES.length}</div>
          <div className="text-[7px] text-[#888]">Pokédex</div>
        </PixelFrame>
      </div>

      {/* Recent savings */}
      <PixelFrame>
        <h3 className="text-[10px] mb-3">Recent Saves</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {savingsLog.slice(0, 20).map(entry => (
            <div key={entry.id} className="flex justify-between text-[8px] border-b border-[#eee] pb-1">
              <span className="truncate max-w-[200px]">{entry.productName}</span>
              <span className="text-[#78c850] font-bold">${(entry.amountSaved / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </PixelFrame>

      {/* Share card */}
      <ShareCard
        totalSaved={totalSaved}
        creaturesCollected={uniqueOwned}
        totalCreatures={CREATURES.length}
        bestStreak={bestStreak}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create ShareCard component using Canvas API**

```tsx
// packages/web/src/components/ShareCard.tsx
import { useRef } from 'react';
import { PixelButton } from './PixelButton';

interface ShareCardProps {
  totalSaved: number;
  creaturesCollected: number;
  totalCreatures: number;
  bestStreak: number;
}

export function ShareCard({ totalSaved, creaturesCollected, totalCreatures, bestStreak }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 315;

    // Background
    ctx.fillStyle = '#fefcd0';
    ctx.fillRect(0, 0, 600, 315);

    // Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 594, 309);

    // Title
    ctx.fillStyle = '#333';
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('🐣 Hatchling', 24, 44);

    // Stats
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = '#78c850';
    ctx.fillText(`$${(totalSaved / 100).toFixed(0)} saved`, 24, 90);

    ctx.fillStyle = '#6890f0';
    ctx.fillText(`${creaturesCollected}/${totalCreatures} creatures`, 24, 120);

    ctx.fillStyle = '#f8d030';
    ctx.fillText(`${bestStreak} best streak`, 24, 150);

    ctx.fillStyle = '#888';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('Turn impulse purchases into pixel friends', 24, 290);
  };

  const downloadCard = () => {
    generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'hatchling-stats.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px]">Share Your Progress</h3>
      <canvas ref={canvasRef} className="hidden" />
      <PixelButton onClick={downloadCard} variant="secondary" size="sm">
        Download Share Card 📤
      </PixelButton>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/pages/Stats.tsx packages/web/src/components/ShareCard.tsx packages/web/src/components/SavingsCounter.tsx
git commit -m "feat: add stats page with savings summaries and shareable image card"
```

---

### Task 15: Settings Page

**Files:**
- Create: `packages/web/src/pages/Settings.tsx`

Settings page mirrors extension Options but in the web app. All settings write to the same Supabase `profiles` table. Includes:
- Display name
- Spending threshold
- Incubation period
- Cooldown settings
- Whitelisted domains
- Share profile toggle
- Extension install link/instructions

- [ ] **Step 1: Create Settings page**
- [ ] **Step 2: Commit**

---

## Phase 4: Assets & Polish (Tasks 16-18)

### Task 16: Generate Placeholder Pixel Art Sprites

**Files:**
- Create: `packages/web/public/sprites/eggs/` (5 egg sprites, one per rarity)
- Create: `packages/web/public/sprites/creatures/` (100+ creature sprites, 32x32)
- Create: `packages/web/public/sprites/ui/` (gacha machine, buttons, frames)
- Create: `packages/extension/icons/` (extension icons)
- Create: `scripts/generate-sprites.ts`

- [ ] **Step 1: Create a sprite generation script**

Use Canvas API in a Node script to generate simple 32x32 pixel art placeholders:
- Each creature: colored blob with 2 pixel eyes and a mouth, colored by rarity
- Each egg: oval shape with speckles, colored by rarity
- Each creature gets a slightly different shape (round, tall, wide, spiky, etc.)

```typescript
// scripts/generate-sprites.ts
// Uses node-canvas to generate placeholder sprites
// Each creature gets:
// - Body shape (one of 8 base shapes)
// - Rarity-based color
// - Simple pixel face (eyes + mouth)
// - Unique seed-based variation (ear shape, tail, spots, etc.)
```

- [ ] **Step 2: Generate all sprites**

```bash
npx ts-node scripts/generate-sprites.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/public/sprites/ packages/extension/icons/ scripts/
git commit -m "feat: generate placeholder pixel art sprites for all creatures and UI"
```

---

### Task 17: Seed Creature & Cosmetic Data

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create seed file with all 100+ creatures and 20 cosmetics**

```sql
-- supabase/seed.sql
INSERT INTO public.creature_defs (id, name, rarity, sprite_path, description, safari_only) VALUES
(1, 'Pennypuff', 1, '/sprites/creatures/001.png', 'A small fluffy creature that collects loose change.', false),
(2, 'Budgibee', 1, '/sprites/creatures/002.png', 'A busy bee that buzzes around bargain bins.', false),
-- ... all 100+ creatures ...

INSERT INTO public.cosmetic_defs (id, name, category, sprite_path, price, description) VALUES
(1, 'Top Hat', 'hat', '/sprites/cosmetics/hat-tophat.png', 2000, 'A distinguished pixel top hat.'),
(2, 'Crown', 'hat', '/sprites/cosmetics/hat-crown.png', 5000, 'A golden crown fit for a savings monarch.'),
-- ... all 20 cosmetics ...
```

- [ ] **Step 2: Run seed**

```bash
npx supabase db reset
```

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: seed 100+ creatures and 20 cosmetic items"
```

---

### Task 18: Landing Page & Onboarding Flow

**Files:**
- Create: `packages/web/src/pages/Landing.tsx` (full implementation)

- [ ] **Step 1: Create Landing page**

The landing page should:
- Hero section with pixel art gacha machine illustration
- "Turn impulse purchases into pixel friends" tagline
- How it works: 3-step illustration (Resist → Pull → Collect)
- Sign up / Log in buttons
- Link to Chrome Web Store (extension)

After signup, redirect to an onboarding wizard:
1. Set your spending threshold
2. Set incubation period
3. Choose whitelisted domains
4. Install extension prompt

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/Landing.tsx
git commit -m "feat: add landing page with onboarding flow"
```

---

## Phase 5: Integration & Testing (Tasks 19-20)

### Task 19: End-to-End Integration Testing

**Files:**
- Create: `packages/web/tests/` (Vitest unit tests)
- Create: `e2e/` (Playwright E2E tests)

Key test scenarios:
1. User signs up → profile created → settings default correctly
2. Extension detects product on Amazon → price above threshold → overlay appears
3. User clicks "Delay" → token created → redirect to web app
4. User pulls gacha → egg created with correct rarity distribution
5. Egg incubation timer counts down correctly
6. After 2 weeks → egg hatchable → creature added to collection → currency awarded
7. User visits tracked product → warning banner appears
8. User purchases tracked product → egg destroyed → streak broken
9. Safari ticket earned at streak 3 → safari encounter works
10. Share card generates correctly

- [ ] **Step 1: Write unit tests for rarity calculation**
- [ ] **Step 2: Write unit tests for site detectors**
- [ ] **Step 3: Write component tests for key UI components**
- [ ] **Step 4: Write E2E tests for critical flows**
- [ ] **Step 5: Commit**

---

### Task 20: Build, Deploy & Polish

- [ ] **Step 1: Create production build scripts**

```bash
pnpm build:shared && pnpm build:web && pnpm build:ext
```

- [ ] **Step 2: Deploy web app to Vercel/Netlify**
- [ ] **Step 3: Deploy Supabase to production**
- [ ] **Step 4: Build extension for Chrome Web Store submission**
- [ ] **Step 5: Final integration test on production**
- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: production build configuration and deployment setup"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Foundation | 1-3 | Monorepo, database, auth, edge functions |
| 2: Extension | 4-7 | Chrome extension with shopping detection and interception |
| 3: Web App | 8-15 | Full game hub: gacha, collection, store, safari, stats |
| 4: Assets | 16-18 | Pixel art sprites, seed data, landing page |
| 5: Testing | 19-20 | E2E tests, deployment |
