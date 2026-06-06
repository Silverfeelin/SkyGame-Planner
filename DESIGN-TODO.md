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

### Pages (built **and** routed in `redesign-routes.ts`)

| Route             | Component                              |
|-------------------|----------------------------------------|
| `/r`              | `AtmosphericDashboardComponent`        |
| `/r/privacy`      | `AtmosPrivacyComponent`                |
| `/r/settings`     | `AtmosSettingsComponent`               |
| `/r/currency`     | `AtmosCurrencyComponent`               |
| `/r/currency/spent` | `AtmosCurrencySpentComponent`        |
| `/r/item`         | `AtmosItemGridComponent` (redirect target) |
| `/r/item/grid`    | `AtmosItemGridComponent`               |
| `/r/item/table`   | `AtmosItemsComponent`                  |
| `/r/item/preview` | `AtmosItemPreviewComponent`            |
| `/r/item/dye`     | `AtmosItemDyeComponent`                |
| `/r/item/heart`   | `AtmosItemHeartsComponent`             |
| `/r/item/collection` | `AtmosItemCollectionComponent`      |
| `/r/item/field-guide` | `AtmosItemFieldGuideComponent`     |
| `/r/item/inflation` | `AtmosItemInflationComponent`        |
| `/r/item/unlock`  | `AtmosItemUnlockComponent`             |
| `/r/item/unlock-calculator` | `AtmosItemUnlockCalculatorComponent` (+ events/seasons/spirits/favourites sub-cards) |
| `/r/item/:guid`   | `AtmosItemDetailComponent`             |
| `/r/spirit`       | `AtmosSpiritsComponent`                |
| `/r/spirit/elusive` | `AtmosElusiveSpiritsComponent`       |
| `/r/spirit/:guid` | `AtmosSpiritComponent`                 |
| `/r/spirit-tree/viewer` | `AtmosSpiritTreeViewerComponent` |
| `/r/spirit-tree/:guid` | `AtmosSpiritTreeViewComponent`    |
| `/r/ts`           | `AtmosTravelingSpiritsComponent`       |
| `/r/rs`           | `AtmosReturningSpiritsComponent`       |
| `/r/rs/:guid`     | `AtmosReturningSpiritComponent`        |
| `/r/winged-light` | `AtmosWingedLightComponent`            |
| `/r/wing-buff`    | `AtmosWingBuffsComponent`              |
| `/r/col`          | `AtmosChildrenOfLightComponent`        |
| `/r/season`       | `AtmosSeasonsComponent`                |
| `/r/season/optimizer` | `AtmosSeasonOptimizerComponent`    |
| `/r/season/:guid` | `AtmosSeasonComponent`                 |
| `/r/season-calculator` | `AtmosSeasonCalculatorComponent`  |
| `/r/event`        | `AtmosEventsComponent`                 |
| `/r/event/history` | `AtmosEventHistoryComponent`          |
| `/r/event/:guid`  | `AtmosEventComponent`                  |
| `/r/event-calculator` | `AtmosEventCalculatorComponent`    |
| `/r/event-instance/:guid` | `AtmosEventInstanceComponent`  |
| `/r/daily`        | `AtmosDailyComponent`                  |
| `/r/realm`        | `AtmosRealmsComponent`                 |
| `/r/realm/shared-creations` | `AtmosSharedCreationsComponent` |
| `/r/realm/pnr-tracker` | `AtmosPnrTrackerComponent`        |
| `/r/realm/cr-tracker` | `AtmosCrTrackerComponent` (with `canDeactivateAtmosCrTracker` guard) |
| `/r/realm/:guid`  | `AtmosRealmComponent`                  |
| `/r/area`         | `AtmosAreasComponent`                  |
| `/r/area/:guid`   | `AtmosAreaComponent`                   |
| `/r/shop`         | `AtmosShopsComponent`                  |
| `/r/shop/cinema`  | `AtmosShopCinemaComponent`             |
| `/r/shop/concert-hall` | `AtmosShopConcertHallComponent`   |
| `/r/shop/event`   | `AtmosShopEventStoreComponent`         |
| `/r/shop/harmony` | `AtmosShopHarmonyHallComponent`        |
| `/r/shop/nesting` | `AtmosShopNestingComponent`            |
| `/r/shop/office`  | `AtmosShopOfficeComponent`             |
| `/r/shop/wonderland-cafe` | `AtmosShopWonderlandComponent` |
| `/r/friend`       | `AtmosFriendsComponent`                |
| `/r/tool`         | `AtmosToolsComponent`                  |
| `/r/outfit-request/closet` | `AtmosClosetComponent`        |
| `/r/outfit-request/collage` | `AtmosCollageComponent`      |
| `/r/outfit-request/vault` | `AtmosOutfitVaultComponent`    |
| `/r/outfit-request/request` | `AtmosClosetRequestComponent` (chromeless — outside `AtmosphericShellComponent`) |
| `/r/news`         | `AtmosNewsComponent`                   |
| `/r/info`         | `AtmosInfoComponent`                   |
| `/r/no-data`      | `AtmosNoDataComponent`                 |
| `/r/dropbox-auth` | `AtmosDropboxAuthComponent` (chromeless) |

Resolved decisions:

- Legacy `/spirits` (`SpiritsOverviewComponent`) is superseded by the grid at `/r/spirit` — no separate overview page in the redesign.
- Legacy `/blank` (`BlankComponent`) is not needed in the redesign.
- `/r/no-data` mirrors the legacy page's title and intro text. Note: the data/icon guards still redirect to the legacy `/no-data` — pointing them at `/r/no-data` is part of making the redesign the default shell.

The `nav-items.ts` `withSeasonIcon` mismatch (`/r/seasons` vs `/r/season`) has been fixed — the canonical link is `/r/season`.

### Shared atmos building blocks

- Dashboard: `AtmosClockComponent`, `AtmosFeatureCardComponent`, `AtmosSearchBarComponent`
- Item grid layout: `AtmosItemGridLayoutComponent`
- Item list: `AtmosItemListComponent` (`item/item-list/`)
- Empty state: `AtmosEmptyStateComponent` (`shared/empty-state/`) — also covers the `/no-data` use case
- Shared widget registry/demo: `shared/atmos-shared-widgets.ts`, `AtmosSharedDemoComponent`
- Section quick-actions (sub-nav pill bars, selector pattern `atmos-<section>-quick-actions` — note: no `app-` prefix):
  - `AtmosItemQuickActionsComponent`
  - `AtmosCurrencyQuickActionsComponent`
  - `AtmosSpiritQuickActionsComponent`
  - `AtmosWingedLightQuickActionsComponent`
  - `AtmosEventQuickActionsComponent`
  - `AtmosRealmQuickActionsComponent` (realms, areas, shared creations — intentionally not on the fullscreen PNR/CR tracker pages, which have their own floating control bars)
  - `AtmosShopQuickActionsComponent` (shop index + all venues)
  - `AtmosToolQuickActionsComponent` (tools index + closet/collage/vault)
- Cards: `AtmosSpiritCardComponent`, `AtmosSeasonCardComponent`, `AtmosEventCardComponent`, `AtmosReturningSpiritCardComponent`, `AtmosIapCardComponent`, `AtmosDailyCardComponent`/`AtmosDailyTaskComponent`/`AtmosDailyCheckinComponent`
- Spirit tree: `AtmosSpiritTreeComponent`, `AtmosNodeComponent`
- Realm constellation: `AtmosRealmConstellationComponent`
- AG-Grid renderers under `src/app/redesign/grid/renderers/`:
  - `AgAtmosItemIconRendererComponent`
  - `AgAtmosItemLinkRendererComponent`
  - `AgAtmosEventLinkRendererComponent`
  - `AgAtmosAreaLinkRendererComponent`
  - `AgAtmosSpiritLinkRendererComponent`
  - `AgAtmosHeartsRendererComponent`

---

## To do — verification

All built pages are now routed (see "Already done"). Remaining follow-ups:

- **Visual pass** (`npm start`): every newly routed page renders inside the shell, sidebar/footer links resolve, and the new quick-actions bars (`realm`, `shop`, `tool`) highlight the active page correctly.
- **Outfit-request wrappers** are thin wrappers around the legacy closet/collage/vault components — verify they render acceptably inside the atmos shell.
- **PNR/CR trackers** intentionally have no section quick-actions bar (fullscreen map tools with their own floating control bars) — revisit if a section bar is wanted there.

---

## To do — not yet built

| Legacy route | Legacy component | Target |
|---|---|---|
| `/storage` | `StorageComponent` | `/r/storage`, or integrate into `/r/settings` |

---

## Shared / supporting components — status

All of the previously planned shared widgets now exist (see "Already done" above). Remaining notes:

| Legacy component | Status |
|---|---|
| `KeyboardShortcutsComponent` | settings page handles keyboard prefs inline — verify parity with the legacy shortcuts list |
| `DashboardAnnouncementComponent`, `DashboardWishlistComponent` | conceptually covered by `AtmosFeatureCardComponent` — verify before duplicating |
| `SearchComponent` | covered by `AtmosSearchBarComponent` |
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

All built pages are routed. Remaining independent chunks:

1. **Visual verification pass** — `npm start`, click through every newly routed section (daily, realms/areas/trackers, shops, friends, tools/outfit-request, news/info).
2. **Not-yet-built leftovers** — `/r/storage` (or fold into `/r/settings`).
3. **Conventions sweep** — pass over the bulk-committed pages for token usage and OnPush/signals. (Legacy-route links missing the `/r` prefix have already been swept — a grep finds none after the season-card fix.)

Each agent should:

- Add its routes to `src/app/redesign/redesign-routes.ts` in the same PR.
- Leave the legacy route untouched.
- Confirm the new page renders via `npm start` and is reachable from the sidebar/footer or from an already-redesigned page.
- Avoid touching `nav-items.ts` until a section's index page exists, so the sidebar never links to a 404.
