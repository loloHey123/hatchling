# Hatchling

A browser extension and web app that gamifies delayed gratification for online shopping. When you resist impulse purchases, you earn creature eggs that hatch into collectible pixel-art creatures.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Web App**: React 18, React Router, Tailwind CSS, Framer Motion, Vite
- **Extension**: Preact, Chrome Manifest V3, Vite
- **Shared**: TypeScript library (types, constants, rarity logic)
- **Backend**: Supabase (Postgres, Auth, Edge Functions, Row-Level Security)

## Setup

### Prerequisites

- Node.js >= 20
- pnpm
- Supabase CLI (`brew install supabase/tap/supabase`)

### Install

```bash
pnpm install
```

### Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Then copy `.env` into `packages/web/` and `packages/extension/`.

### Start Supabase (local)

```bash
supabase start
```

This will output your local `SUPABASE_URL` and `ANON_KEY` -- use those in your `.env`.

## Development

```bash
# Web app (http://localhost:5173)
pnpm dev:web

# Extension (watches for changes, load dist/ in chrome://extensions)
pnpm dev:ext
```

## Build

```bash
pnpm build:web      # Production web build
pnpm build:ext      # Production extension build
pnpm build:shared   # Shared library type-check
```

## Test

```bash
pnpm test           # Run tests across all packages
```

## Project Structure

```
packages/
  shared/       # Types, constants, rarity calculation logic
  web/          # React web app (dashboard, gacha, collection, safari, stats, settings)
  extension/    # Chrome extension (popup, options, content scripts, service worker)
supabase/
  migrations/   # Database schema migrations
  functions/    # Edge functions (hatch-egg, gacha-pull, safari-encounter, etc.)
scripts/        # Sprite generation utilities
```
