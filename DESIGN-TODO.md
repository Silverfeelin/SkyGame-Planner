# Atmospheric Redesign — TODO

This file tracks the migration of the legacy app (under `MenuLayoutComponent` at `/...`) to the **atmospheric** redesign mounted under `/r/...`.

Until a page is rebuilt, the legacy route at `/<path>` and the redesigned route at `/r/<path>` can diverge. The goal is to reach parity on every page reachable from the redesign sidebar / footer nav so the redesign can become the default shell.

---

## Conventions for new redesign work

When picking up an item below, follow these conventions so multiple agents stay consistent:

- **Location**: `src/app/redesign/<section>/<feature>/atmos-<feature>.component.{ts,html,scss}`. Grouping mirrors the legacy `src/app/components/<section>/...` layout where possible.
- **Selector**: `app-atmos-<feature>`.
- **Class name**: `Atmos<Feature>Component`.
- **Standalone component**, `ChangeDetectionStrategy.OnPush`, signals (`signal()`, `computed()`, `effect()`, `input()`, `output()`), and `@if`/`@for`/`@switch` template control flow.
- **Styling**: `.scss`. Use the design tokens and utility classes from `src/styles/atmospheric.scss` (`--atmos-*` custom properties, `.atmos-card`, `.atmos-btn`, `.atmos-pill`, `.atmos-page__header`, `.atmos-text-link`, `.atmos-focus-ring`, etc.). Do **not** introduce new colour or radius literals — extend the token file instead.
- **Routing**: add the route to `src/app/redesign/redesign-routes.ts` under the `AtmosphericShellComponent` parent. Match the legacy URL slug under the `/r` prefix (e.g. `event` → `/r/event`).
- **Nav**: if the section appears in `src/app/redesign/shell/nav-items.ts`, make sure the link resolves; otherwise leave a 404 placeholder until the parent index page exists.
- **Data**: reuse existing services (`DataService`, `StorageService`, `NodeService`, `EventService`, `SettingService`) and helpers (`NodeHelper`, `TreeHelper`, `DateHelper`, etc.). Do not duplicate game logic in the redesign tree.
- **Shared widgets that already look fine atmospherically** (e.g. `ItemIconComponent`, `ItemSubIconsComponent`, `OverlayComponent`, `WikiLinkComponent`) can be imported as-is. Build a new atmospheric variant only when the legacy component carries legacy styles or layout that conflict with the new shell.
- **Don't** rewrite legacy `.less` files or migrate them to `.scss`. Leave the legacy route working unchanged.
- **Don't** add show/hide-section toggles in settings; always-show is the project preference.

---

## Already done

For reference — these are the pages and shared atmos components that already exist. Don't re-do them; reuse them.

### Shell & framework

- `AtmosphericShellComponent` (`src/app/redesign/shell/atmospheric-shell.component.ts`)
- `AtmosphericSidebarComponent`, `AtmosphericTopbarComponent`, `AtmosphericFooterComponent`
- Nav tables: `src/app/redesign/shell/nav-items.ts` (`REDESIGN_NAV`, `REDESIGN_FOOT_NAV`)
- Design tokens & utility classes: `src/styles/atmospheric.scss`

### Pages

| Route             | Component                              |
|-------------------|----------------------------------------|
| `/r`              | `AtmosphericDashboardComponent`        |
| `/r/privacy`      | `AtmosPrivacyComponent`                |
| `/r/settings`     | `AtmosSettingsComponent`               |
| `/r/item`         | `AtmosItemGridComponent` (redirect target) |
| `/r/item/grid`    | `AtmosItemGridComponent`               |
| `/r/item/table`   | `AtmosItemsComponent`                  |
| `/r/item/preview` | `AtmosItemPreviewComponent`            |
| `/r/item/dye`     | `AtmosItemDyeComponent`                |
| `/r/item/heart`   | `AtmosItemHeartsComponent`             |
| `/r/item/collection` | `AtmosItemCollectionComponent`      |
| `/r/item/:guid`   | `AtmosItemDetailComponent`             |

### Shared atmos building blocks

- Dashboard: `AtmosClockComponent`, `AtmosFeatureCardComponent`, `AtmosSearchBarComponent`
- Item grid layout: `AtmosItemGridLayoutComponent`
- Item quick-actions: `AtmosItemQuickActionsComponent`
- AG-Grid renderers under `src/app/redesign/grid/renderers/`:
  - `AgAtmosItemIconRendererComponent`
  - `AgAtmosEventLinkRendererComponent`
  - `AgAtmosAreaLinkRendererComponent`
  - `AgAtmosSpiritLinkRendererComponent`
  - `AgAtmosHeartsRendererComponent`

---

## To do — pages

Pages are grouped by sidebar section. Each row lists the legacy route, the legacy component, and the target redesign route. **Agents may work on different sections in parallel** — within a section, build the index/landing page before the detail pages because the index usually defines shared list-card / filter patterns the detail pages can reuse.

### Daily — sidebar `Daily` (`/r/daily`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/daily` | `DailyComponent` (`components/daily/daily.component.ts`) | `/r/daily` |

Supporting components to consider redesigning or reusing as-is: `DailyTaskComponent`, `DailyCardComponent`, `DailyCheckinComponent`.

### Currency — sidebar `Currency` (`/r/currency`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/currency` | `CurrencyComponent` | `/r/currency` |
| `/currency/spent` | `CurrencySpentComponent` | `/r/currency/spent` |

### Items — sidebar `Items` (`/r/item`)

Item table/grid/preview/dye/heart/collection/detail are already done. **Still missing:**

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/item/field-guide` | `ItemFieldGuideComponent` | `/r/item/field-guide` |
| `/item/inflation` | `ItemInflationComponent` (lazy) | `/r/item/inflation` |
| `/item/unlock` | `ItemUnlockComponent` | `/r/item/unlock` |
| `/item/unlock-calculator` | `ItemUnlockCalculatorComponent` (+ events/seasons/spirits/favourites sub-cards) | `/r/item/unlock-calculator` |

### Spirits — sidebar `Spirits` (`/r/spirit`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/spirits` | `SpiritsOverviewComponent` | `/r/spirits` |
| `/spirit` | `SpiritsComponent` | `/r/spirit` |
| `/spirit/elusive` | `ElusiveSpiritsComponent` | `/r/spirit/elusive` |
| `/spirit/:guid` | `SpiritComponent` | `/r/spirit/:guid` |
| `/spirit-tree/:guid` | `SpiritTreeViewComponent` | `/r/spirit-tree/:guid` |
| `/spirit-tree/viewer` | `SpiritTreeViewerComponent` (lazy) | `/r/spirit-tree/viewer` |
| `/ts` | `TravelingSpiritsComponent` | `/r/ts` |
| `/rs` | `ReturningSpiritsComponent` | `/r/rs` |
| `/rs/:guid` | `ReturningSpiritComponent` | `/r/rs/:guid` |

Shared widgets the redesign will likely want atmospheric variants of: `SpiritCardComponent`, `SpiritTreeComponent`, `ReturningSpiritCardComponent`, `SpiritTypeIconComponent`, `NodeComponent`.

### Winged Light — sidebar `Winged Light` (`/r/winged-light`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/winged-light` | `WingedLightComponent` | `/r/winged-light` |
| `/wing-buff` | `WingBuffsComponent` | `/r/wing-buff` |
| `/col` | `ChildrenOfLightComponent` | `/r/col` |

### Realms — sidebar `Realms` (`/r/realm`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/realm` | `RealmsComponent` | `/r/realm` |
| `/realm/:guid` | `RealmComponent` | `/r/realm/:guid` |
| `/realm/shared-creations` | `SharedCreationsComponent` | `/r/realm/shared-creations` |
| `/realm/pnr-tracker` | `PnrTrackerComponent` | `/r/realm/pnr-tracker` |
| `/realm/cr-tracker` | `CrTrackerComponent` (uses `canDeactivateCrTracker`) | `/r/realm/cr-tracker` |
| `/area` | `AreasComponent` | `/r/area` |
| `/area/:guid` | `AreaComponent` | `/r/area/:guid` |

Shared widget: `RealmConstellationComponent` may need an atmospheric variant if it carries legacy styling.

### Seasons — sidebar `Seasons` (`/r/season`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/season` | `SeasonsComponent` | `/r/season` |
| `/season/:guid` | `SeasonComponent` | `/r/season/:guid` |
| `/season/optimizer` | `SeasonOptimizerComponent` | `/r/season/optimizer` |
| `/season-calculator` | `SeasonCalculatorComponent` | `/r/season-calculator` |

Shared widget: `SeasonCardComponent`.

Also wire the season icon into the sidebar via `withSeasonIcon` once an active season exists; `nav-items.ts` references `/r/seasons` but the canonical link is `/r/season` — pick one and update both.

### Events — sidebar `Events` (`/r/event`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/event` | `EventsComponent` | `/r/event` |
| `/event/history` | `EventHistoryComponent` | `/r/event/history` |
| `/event/:guid` | `EventComponent` | `/r/event/:guid` |
| `/event-calculator` | `EventCalculatorComponent` | `/r/event-calculator` |
| `/event-instance/:guid` | `EventInstanceComponent` | `/r/event-instance/:guid` |

Shared widget: `EventCardComponent`.

### Shops — sidebar `Shops` (`/r/shop`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/shop` | `ShopsComponent` | `/r/shop` |
| `/shop/cinema` | `ShopCinemaComponent` | `/r/shop/cinema` |
| `/shop/concert-hall` | `ShopConcertHallComponent` | `/r/shop/concert-hall` |
| `/shop/event` | `ShopEventStoreComponent` | `/r/shop/event` |
| `/shop/harmony` | `ShopHarmonyHallComponent` | `/r/shop/harmony` |
| `/shop/nesting` | `ShopNestingComponent` | `/r/shop/nesting` |
| `/shop/office` | `ShopOfficeComponent` | `/r/shop/office` |
| `/shop/wonderland-cafe` | `ShopWonderlandComponent` | `/r/shop/wonderland-cafe` |

Shared widget: `IapCardComponent` — likely needs an atmospheric variant.

### Friends — sidebar `Friends` (`/r/friend`)

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/friends` | `FriendsComponent` | `/r/friend` (note singular in nav; align URL or nav) |

### Tools — sidebar `Tools` (`/r/tool`)

The legacy `/tools` page is an index that links into many features. The redesign should likely surface only the tools whose target pages have already been redesigned and gate the rest.

| Legacy route | Legacy component | Target redesign route |
|---|---|---|
| `/tools` | `ToolsComponent` | `/r/tool` (note singular in nav; align URL or nav) |
| `/outfit-request/collage` | `CollageComponent` | `/r/outfit-request/collage` |
| `/outfit-request/closet` | `ClosetComponent` | `/r/outfit-request/closet` |
| `/outfit-request/vault` | `OutfitVaultComponent` | `/r/outfit-request/vault` |
| `/outfit-request/request` | `ClosetComponent` (chromeless) | `/r/outfit-request/request` (no sidebar — sits outside `AtmosphericShellComponent`) |

### Footer nav

| Footer item | Legacy route | Legacy component | Target redesign route |
|---|---|---|---|
| `What's new` | `/news` | `NewsComponent` | `/r/news` |
| `Settings` | done — `/settings` | `SettingsComponent` | `/r/settings` ✅ |
| `Info` | (closest legacy is `/credits`) | `CreditsComponent` | `/r/info` — decide scope (credits + about + version + links) |

### Out-of-shell / utility pages

These don't sit under `AtmosphericShellComponent` but still need atmospheric treatment if a user can land on them while using the redesign.

| Legacy route | Legacy component | Target redesign route / location |
|---|---|---|
| `/no-data` | `NoDataComponent` | atmospheric error/empty state — likely a shared component, not its own route |
| `/storage` | `StorageComponent` | `/r/storage` (or integrate into `/r/settings`) |
| `/dropbox-auth` | `DropboxAuthComponent` | `/r/dropbox-auth` (chromeless) |
| `/blank` | `BlankComponent` | not needed in redesign |

---

## To do — shared / supporting components

These are reused by many pages. Build them as agents touch the first page that needs them so they emerge from real usage rather than being designed in isolation, but the list is captured here so two agents don't reinvent the same widget under different names.

| Legacy component | Suggested atmos location | Used by |
|---|---|---|
| `SpiritCardComponent` | `redesign/spirit/spirit-card/atmos-spirit-card.component.*` | spirits list, season detail, event detail |
| `SpiritTreeComponent` | `redesign/spirit/spirit-tree/atmos-spirit-tree.component.*` | spirit detail, spirit-tree view, TS/RS |
| `NodeComponent` | `redesign/spirit/node/atmos-node.component.*` | inside spirit tree |
| `SeasonCardComponent` | `redesign/season/season-card/atmos-season-card.component.*` | seasons list, dashboard |
| `EventCardComponent` | `redesign/event/event-card/atmos-event-card.component.*` | events list, dashboard |
| `ReturningSpiritCardComponent` | `redesign/spirit/returning-spirit-card/atmos-returning-spirit-card.component.*` | RS list |
| `RealmConstellationComponent` | `redesign/realm/constellation/atmos-realm-constellation.component.*` | realm detail |
| `IapCardComponent` | `redesign/shop/iap-card/atmos-iap-card.component.*` | every shop page |
| `DailyCardComponent`, `DailyTaskComponent`, `DailyCheckinComponent` | `redesign/daily/...` | daily, dashboard |
| `ItemListComponent` | `redesign/item/item-list/atmos-item-list.component.*` | many — spirit tree, shop, season etc. |
| `KeyboardShortcutsComponent` | `redesign/settings/keyboard-shortcuts/...` | settings |
| `DashboardAnnouncementComponent`, `DashboardWishlistComponent` | already conceptually covered by `AtmosFeatureCardComponent` — verify before duplicating |
| `SearchComponent` | already covered by `AtmosSearchBarComponent` |
| `MenuComponent` | replaced by `AtmosphericSidebarComponent` / `AtmosphericTopbarComponent` |
| `ClockComponent` | replaced by `AtmosClockComponent` |

Util components that are visually neutral and can be reused as-is (no atmos variant needed): `IconComponent`, `ItemIconComponent`, `ItemSubIconsComponent`, `WikiLinkComponent`, `OverlayComponent`, `CardComponent`, `CheckboxComponent`, `TabsComponent`, `CalendarLinkComponent`, `DiscordLinkComponent`, `DaysLeftComponent`, `DurationComponent`, `CostComponent`, `SpiritTypeIconComponent`, `IconPickerComponent`, `ItemTypeSelectorComponent`, `TableComponent`. Verify on first use — wrap or theme if any of them ships hard-coded legacy colours.

---

## Out of scope

- `/editor/**` — contributor-only tooling under `MenuLayoutComponent`. Keep on the legacy shell.
- `/graph/**` — analytics section. Keep on the legacy shell.
- `/experiment/**` — experiments. Keep on the legacy shell.

---

## Suggested agent fan-out

Independent sections that can be worked on in parallel by separate agents:

1. **Daily** — single page, small surface, good warmup.
2. **Currency** — two pages, mostly tabular.
3. **Items / remaining** — field guide, unlock, unlock calculator, inflation. Shares idioms with the already-redesigned item table.
4. **Spirits** — large surface; build `atmos-spirit-card` and `atmos-spirit-tree` first, then list pages, then detail pages, then TS/RS.
5. **Winged Light + Wing Buffs + COL** — closely related, one agent.
6. **Realms + Areas + trackers** — one agent; PNR/CR trackers are heavy interactive pages, handle last.
7. **Seasons** — including optimizer/calculator. Build `atmos-season-card` first.
8. **Events** — including history/calculator/instance. Build `atmos-event-card` first.
9. **Shops** — index + 7 venue pages; build `atmos-iap-card` first, then fan out per venue.
10. **Friends** — single page.
11. **Tools + outfit-request (collage / closet / vault)** — one agent.
12. **Footer: News + Info** — one agent (both are content-only pages).

Each agent should:

- Add its routes to `src/app/redesign/redesign-routes.ts` in the same PR.
- Leave the legacy route untouched.
- Confirm the new page renders via `npm start` and is reachable from the sidebar/footer or from an already-redesigned page.
- Avoid touching `nav-items.ts` until a section's index page exists, so the sidebar never links to a 404.
