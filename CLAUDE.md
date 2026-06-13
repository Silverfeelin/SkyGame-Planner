# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sky Planner is an Angular 19 fan-made SPA for tracking items and progress in the game *Sky: Children of the Light*. Live at https://sky-planner.com/, deployed on Cloudflare Pages.

## Commands

```bash
npm start              # dev server (no HMR)
npm run start-proxy    # dev server with proxy config (environment.proxy.ts)
npm run build          # dev build
npm run build-prod     # production build (sitemap + ng build + license-move)
npm test               # Karma/Jasmine tests
npm run wrangle        # local Cloudflare Pages dev with KV binding
```

Run a single test file by adding `--include` to the karma config or filtering via the `fit`/`fdescribe` Jasmine API.

## Architecture

### Data layer

All game data comes from the [`skygame-data`](https://github.com/Silverfeelin/SkyGame-Data) npm package. On startup, `DataService` fetches `/assets/skygame-data/everything.json`, parses it with `SkyDataResolver.parse/resolve`, and populates typed config arrays (`spiritConfig`, `itemConfig`, `seasonConfig`, etc.). A `guidMap: Map<string, IGuid>` is the central registry for all entities—every entity has a 10-character GUID.

After data loads, helpers and raw configs are exposed on `window.skyData` / `window.NodeHelper` etc. for browser-console debugging.

Types for all data entities come from `skygame-data`: `IArea`, `IEvent`, `IIAP`, `IItem`, `INode`, `IRealm`, `ISeason`, `IShop`, `ISpirit`, `ISpiritTree`, `ITravelingSpirit`, `IWingedLight`, and more. Use the `@app/*` path alias (maps to `src/app/*`) throughout.

### Storage layer

`StorageService` delegates to a swappable `IStorageProvider`. The factory picks a provider at startup:

- `LocalStorageProvider` — default; synchronous read/write to `localStorage`
- `DropboxStorageProvider` — optional cloud sync via OAuth2

Tracked data is keyed by GUID: unlocked nodes/items, winged lights, favourites, season passes, gifted IAPs, map markers, and free-form keys. Changes fire a `data_changed` event on `StorageService.events` and a `BroadcastService` message so tabs stay in sync.

### Routing / layout

The shell is built around the **atmospheric redesign** (`--atmos-*` token system in `src/styles/atmospheric.scss`):

- `MainLayoutComponent` — bootstrap gate; runs `forkJoin(canActivateData, canActivateIcons, canActivateStorage)` and shows loading/error/save-state overlays. Sits *above* all routes so editor and graph are also gated. Does **not** own visible chrome.
- `AtmosphericShellComponent` — the visible shell (header, nav, footer) for all public-facing pages; rendered inside the gate.

Two lazy-loaded sections sit outside the atmos shell but still inside the gate:
- `/editor` — data-entry editor for contributors (spirit trees, outfit shrines, items, dyes)
- `/graph` — analytics/graphs

### Key services

| Service | Purpose |
|---|---|
| `DataService` | Loads & holds all game data; `onData` ReplaySubject fires once data is ready |
| `StorageService` | Wraps the active storage provider; all reads/writes go through here |
| `NodeService` | Unlock/lock a spirit-tree node with proper cascading (items ↔ nodes) |
| `EventService` | Centralizes `keydown`, `click`, `storage` browser events; keyboard shortcut count |
| `SettingService` | Per-user preference keys backed by `StorageService` |
| `BroadcastService` | Cross-tab messaging via `BroadcastChannel` |

### Helpers

Static helpers in `src/app/helpers/` (not services): `NodeHelper`, `TreeHelper`, `CostHelper`, `ItemHelper`, `DateHelper`, `ArrayHelper`. These are also exposed on `window` in dev mode.

### Coding standards

In **new code**, use modern Angular APIs:

- **Signals** for component state and reactivity (`signal()`, `computed()`, `effect()`) instead of class fields with `ChangeDetectorRef` or `async` pipe patterns.
- **`input()` / `output()`** signal-based functions instead of `@Input()` / `@Output()` decorators.
- **Control flow syntax** in templates (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

Do not rewrite existing code to these APIs unless the task specifically asks for it—match the surrounding style when editing old files.

### Styling

Components use **`.scss`** — the codebase was migrated from `.less` as part of the atmospheric redesign. Use `.scss` for all new components. Do not convert surviving `.less` files unless the task specifically asks for it.

### Scripts

- `scripts/data/` — one-off data manipulation (add events, apply GUIDs, etc.)
- `scripts/build/` — sitemap generation and license file post-processing
- `scripts/icon-sheet.ts` — regenerates the SVG icon sprite sheet
- `functions/api/` — Cloudflare Worker functions (dyes API, outfit vault, outfit requests)
