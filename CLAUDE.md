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

Routes live in `src/app/app-routes.ts`. The UI is built on the `--atmos-*` token system in `src/styles/styles.scss`:

- `MainLayoutComponent` — bootstrap gate; runs `forkJoin(canActivateData, canActivateIcons, canActivateStorage)` and shows loading/error/save-state overlays. Sits *above* all routes so editor and graph are also gated. It also composes the visible chrome inline from `components/layout/shell/{topbar,sidebar,footer}`, and carries the `atmospheric` host class that scopes the global Leaflet overrides.
- Routes with `data: { chrome: false }` (`outfit-request/request`, `dropbox-auth`) render inside the gate without that chrome.

Two lazy-loaded sections sit inside the gate as well:
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

#### Comments

Only comment where the code cannot speak for itself. A comment explains *why*—a non-obvious constraint, a workaround, an ordering requirement, a game rule that isn't evident from the identifiers.

- Keep comments as short as the point allows; one line is usually enough.
- Do not restate what the code already says, and do not label sections that the structure already makes clear.
- Never write comments about the change itself ("new", "updated", "was X before", "moved from Y", "per request"). Comments describe the code as it stands, not the session that produced it; that history belongs in the commit message.
- Prefer clearer naming or a small extracted function over a comment that compensates for unclear code.
- These rules take priority over adhering to the format of existing comments.

### Styling

Components use **`.scss`**. `src/styles/styles.scss` is the global base + design-system sheet (`#region` markers split it into Base / Tokens / Components / Themes / Utilities); `charts.scss`, `map.scss` and `grid.scss` are separate entries in `angular.json`, loaded in that order.

#### Breakpoints vs. themes vs. density

Three independent axes:

- **Responsive breakpoint** — `@media (max-width: 1023px)` is the tablet/mobile layout, `min-width: 1024px` desktop.
- **Colour theme** — `:root[data-theme="..."]` in the Themes region (default, sandy, dark, love, moomin, wonderland). Colour only.
- **Density** — `:root[data-density="compact"]`, also in the Themes region. Geometry only (padding, gaps, media heights).

A token that should change with screen size belongs in the `@media` block, never in the `compact` block.

Per-user slider tweaks (`src/theme-overrides.ts`) are written as inline `--atmos-*` properties on `<html>`, so they sit above any `data-theme` rule; keep hue, chroma, surface lightness, background image and vignette as single tokens on `:root` for that reason.

### Scripts

- `scripts/data/` — one-off data manipulation (add events, apply GUIDs, etc.)
- `scripts/build/` — sitemap generation and license file post-processing
- `scripts/icon-sheet.ts` — regenerates the SVG icon sprite sheet
- `functions/api/` — Cloudflare Worker functions (dyes API, outfit vault, outfit requests)
