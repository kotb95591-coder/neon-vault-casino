# Aurora — Premium Casino (visual demo)

A **purely visual** online-casino frontend inspired by the look-and-feel of
modern operators (Stake, BetMGM, 1xBet). No backend, no real money, no
emoji glyphs — every symbol is a hand-drawn SVG and the entire UI is
built from React components and CSS Modules.

> **Demo only · No real money · 18+** — this project is a UI showcase. It
> performs no network requests, stores nothing, and accepts no payment of
> any kind. It is not, and is not intended to be, a gambling product.

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) +
  [TypeScript](https://www.typescriptlang.org/)
- CSS Modules with design tokens defined as CSS custom properties
- No CSS framework, no animation library, no SVG sprite tooling

## Highlights

- Full lobby experience: top navigation, sidebar with categories and a VIP
  promotion panel, hero promo banner with animated orbs, and several
  curated game grids.
- A roster of procedurally-styled game tiles spanning slots, live tables,
  table games, crash and instant-win games. Each card draws its own
  palette-driven gradient art.
- Multiple playable mini-games: themed 5×3 slot machines, a crash chart,
  blackjack, roulette and an instant-win round — all with their own
  visuals and controls.
- Bet steppers, MAX BET and Autoplay controls, animated balance and a
  celebratory win overlay (Win / Big Win / Mega Win tiers).
- Designed dark first; responsive down to mobile widths.

## Project layout

```
src/
├── App.tsx                    # Top-level state & routing
├── main.tsx                   # React entry point
├── index.css                  # Design tokens and global styles
├── types.ts                   # Shared TypeScript types
├── data/                      # Game catalogue and slot configuration
└── components/
    ├── common/                # Shared icons / primitives
    ├── layout/                # AppLayout / TopNav / Sidebar
    ├── lobby/                 # PromoBanner / GameCard / GameSection / Lobby
    └── slot/                  # SlotMachine, Reel, ControlBar, Paytable, …
```

The slot engine (`src/components/slot/engine.ts`) is pure TypeScript with
no DOM dependencies and can be unit-tested in isolation.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run lint     # ESLint
```
