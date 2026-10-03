import { Params } from '@angular/router';
import { DateHelper } from '@app/helpers/date-helper';
import type { DataService } from '@app/services/data.service';

export interface IPage {
  label: string;
  /** Internal route, or a full URL when `external` is set. */
  link: string;
  icon: string;
  svgIcon?: string;
  external?: boolean;
  queryParams?: Params;
  /** `'withQuery'` also compares query params, so sibling filter links don't light up together. */
  exact?: boolean | 'withQuery';
  /** Name and match text in search, both defaulting to the label. `false` keeps the page out of search. */
  search?: false | { name?: string; text?: string };
  /** Hides the page from quick actions when the loaded data makes it irrelevant. */
  visible?: (data: DataService) => boolean;
}

const WIKI = 'https://sky-children-of-the-light.fandom.com/wiki';

/** Seasons with friendship levels are handled by the optimizer instead of the calculator. */
const currentSeasonHasTiers = (data: DataService): boolean => {
  const seasons = data.seasonConfig.items;
  const season = DateHelper.getActive(seasons) || seasons.at(-1);
  return !!season?.spirits.some(s => s.tree?.tier);
};

export const PAGES = {
  daily:            { label: 'Daily', link: '/daily', icon: 'checklist', exact: true },
  crTracker:        { label: 'Candle Run Tracker', link: '/realm/cr-tracker', icon: 'local_fire_department', svgIcon: 'candle' },
  pnrTracker:       { label: 'Eden Statue Tracker', link: '/realm/pnr-tracker', icon: 'flag' },

  currency:         { label: 'Currencies', link: '/currency', icon: 'wallet', svgIcon: 'candle', exact: true },
  currencySpent:    { label: 'Spent currencies', link: '/currency/spent', icon: 'wallet', search: { name: 'Spent currency' } },
  wikiCurrency:     { label: 'Wiki - Currency', link: `${WIKI}/Currency`, icon: 'open_in_new', external: true, search: false },

  itemGrid:         { label: 'Item grid', link: '/item/grid', icon: 'grid_view', search: { name: 'Items' } },
  itemTable:        { label: 'Item table', link: '/item/table', icon: 'table_chart' },
  itemPreview:      { label: 'Item previews', link: '/item/preview', icon: 'image' },
  itemDye:          { label: 'Dye previews', link: '/item/dye', icon: 'palette' },
  itemCollection:   { label: 'Collections', link: '/item/collection', icon: 'collections', search: { name: 'Item collections' } },
  itemHearts:       { label: 'Hearts', link: '/item/heart', icon: 'favorite' },
  itemCost:         { label: 'Cost calculator', link: '/item/unlock-calculator', icon: 'calculate', search: { name: 'Item unlock calculator' } },
  itemGoals:        { label: 'Goals', link: '/item/goals', icon: 'savings', search: { text: 'Goals saving planner' } },
  itemInflation:    { label: 'Item inflation', link: '/item/inflation', icon: 'trending_up' },
  suggestItem:      { label: 'Suggest new item', link: 'https://github.com/Silverfeelin/SkyGame-Planner/issues', icon: 'add_circle', external: true, search: false },
  wikiCosmetics:    { label: 'Wiki - Cosmetics', link: `${WIKI}/Cosmetics`, icon: 'open_in_new', external: true, search: false },

  spirits:          { label: 'All spirits', link: '/spirit', icon: 'person', exact: 'withQuery', search: { name: 'Spirits' } },
  regularSpirits:   { label: 'Regular spirits', link: '/spirit', queryParams: { type: 'Regular' }, icon: 'person', svgIcon: 'candle', exact: 'withQuery', search: false },
  elderSpirits:     { label: 'Elder spirits', link: '/spirit', queryParams: { type: 'Elder' }, icon: 'person', svgIcon: 'ascended-candle', exact: 'withQuery', search: false },
  seasonSpirits:    { label: 'Season spirits', link: '/spirit', queryParams: { type: 'Season' }, icon: 'person', svgIcon: 'season-candle', exact: 'withQuery', search: false },
  seasonGuides:     { label: 'Season guides', link: '/spirit', queryParams: { type: 'Guide' }, icon: 'person', svgIcon: 'season-heart', exact: 'withQuery', search: false },
  travelingSpirits: { label: 'Traveling spirits', link: '/ts', icon: 'hiking' },
  specialVisits:    { label: 'Special visits', link: '/rs', icon: 'flight' },
  elusiveSpirits:   { label: 'Elusive spirits', link: '/spirit/elusive', icon: 'timer' },
  spiritGraphs:     { label: 'Graphs - Spirits', link: '/graph/spirit', icon: 'trending_up' },
  wikiSpirits:      { label: 'Wiki - Spirits', link: `${WIKI}/Spirits`, icon: 'open_in_new', external: true, search: false },
  spiritTreeEditor: { label: 'Spirit tree editor', link: '/editor/spirit-tree', icon: 'account_tree', search: false },

  wingedLight:      { label: 'Winged Light', link: '/winged-light', icon: 'air', svgIcon: 'flaps', exact: true },
  childrenOfLight:  { label: 'Children of Light', link: '/col', icon: 'light_mode' },
  wingBuffs:        { label: 'Wing buffs', link: '/wing-buff', icon: 'air' },
  wikiWingedLight:  { label: 'Wiki - Winged Light', link: `${WIKI}/Winged_Light`, icon: 'open_in_new', external: true, search: false },

  realms:           { label: 'Realms', link: '/realm', icon: 'map', exact: true },
  areas:            { label: 'Areas', link: '/area', icon: 'location_on' },
  sharedCreations:  { label: 'Shared Creations', link: '/realm/shared-creations', icon: 'place' },
  wikiRealms:       { label: 'Wiki - Realms', link: `${WIKI}/Realms`, icon: 'open_in_new', external: true, search: false },

  seasons:          { label: 'Seasons', link: '/season', icon: 'ac_unit', exact: true },
  seasonOptimizer:  { label: 'Season optimizer', link: '/season/optimizer', icon: 'calculate', visible: currentSeasonHasTiers },
  seasonCalculator: { label: 'Season calculator', link: '/season/calculator', icon: 'calculate', visible: (data: DataService) => !currentSeasonHasTiers(data) },
  wikiSeasons:      { label: 'Wiki - Seasonal Events', link: `${WIKI}/Seasonal_Events`, icon: 'open_in_new', external: true, search: false },
  eventCalendar:    { label: 'Sky Event Calendar | FM', link: 'https://skydreamers.notion.site/Sky-Event-Calendar-FM-ec6e6134924048859b2a8410b0a8b20d', icon: 'open_in_new', external: true, search: false },

  events:           { label: 'Events', link: '/event', icon: 'celebration', exact: true },
  eventHistory:     { label: 'History', link: '/event/history', icon: 'history', search: { name: 'Event history' } },
  eventCalculator:  { label: 'Event Calculator', link: '/event/calculator', icon: 'calculate', search: { name: 'Event calculator' } },
  wikiEvents:       { label: 'Wiki - Special Events', link: `${WIKI}/Special_Events`, icon: 'open_in_new', external: true, search: false },

  shops:            { label: 'Shops', link: '/shop', icon: 'shopping_cart', exact: true, search: { name: 'Permanent shops' } },
  shopEvent:        { label: 'Event Store', link: '/shop/event', icon: 'storefront', search: { name: 'Shops - Aviary Event Store', text: 'Aviary Event Store' } },
  shopCinema:       { label: 'Cinema', link: '/shop/cinema', icon: 'movie', search: { name: 'Shops - Cinema', text: 'Cinema' } },
  shopConcertHall:  { label: 'Concert Hall', link: '/shop/concert-hall', icon: 'music_note', search: { name: 'Shops - Concert Hall', text: 'Concert Hall' } },
  shopHarmonyHall:  { label: 'Harmony Hall', link: '/shop/harmony', icon: 'piano', search: { name: 'Shops - Harmony Hall', text: 'Harmony Hall' } },
  shopNesting:      { label: 'Nesting Workshop', link: '/shop/nesting', icon: 'chair', search: { name: 'Shops - Nesting Workshop', text: 'Nesting Workshop' } },
  shopOffice:       { label: 'Secret Area', link: '/shop/office', icon: 'business', search: { name: 'Shops - Office', text: 'Office' } },
  shopPrairie:      { label: 'Prairie Heights', link: '/shop/prairieheights', icon: 'toys', search: { name: 'Shops - Prairie Heights', text: 'Prairie Heights' } },
  shopWonderland:   { label: 'Wonderland Café', link: '/shop/wonderland-cafe', icon: 'local_cafe', search: { name: 'Shops - Wonderland Café', text: 'Wonderland Café' } },
  wikiShops:        { label: 'Wiki - Premium Candle Shop', link: `${WIKI}/Premium_Candle_Shop`, icon: 'open_in_new', external: true, search: false },

  friends:          { label: 'Friends', link: '/friend', icon: 'people' },

  tools:            { label: 'Tools', link: '/tool', icon: 'build', exact: true },
  quickStart:       { label: 'Quick start', link: '/quick-start', icon: 'auto_awesome' },
  closet:           { label: 'Sky closet', link: '/outfit-request/closet', icon: 'checkroom', search: { name: 'Outfit request - Closet' } },
  outfitRequest:    { label: 'Create request', link: '/outfit-request/request', icon: 'add', search: { name: 'Outfit request - Request' } },
  collage:          { label: 'Collage', link: '/outfit-request/collage', icon: 'image', search: { name: 'Outfit request - Collage' } },
  outfitVault:      { label: 'Outfit vault', link: '/outfit-request/vault', icon: 'link' },

  designFeedback:   { label: 'Design feedback', link: 'https://docs.google.com/forms/d/e/1FAIpQLScruTqCFHUENPekcpu4BzGmBjBKrf_1CTzT9_R8Yvr7DulDmQ/viewform?usp=publish-editor', icon: 'chat', external: true, search: false },
  news:             { label: `What's new`, link: '/news', icon: 'new_releases' },
  settings:         { label: 'Settings', link: '/settings', icon: 'settings' },
  info:             { label: 'Info', link: '/info', icon: 'info', search: { text: 'Info & credits' } },
  privacy:          { label: 'Privacy Policy', link: '/privacy', icon: 'gavel' },
} satisfies Record<string, IPage>;

export type PageId = keyof typeof PAGES;

export const getPage = (id: PageId): IPage => PAGES[id];

export interface ISection {
  label: string;
  /** Sidebar target; may be a redirect so the item stays active on every page below it. */
  link: string;
  icon: string;
  svgIcon?: string;
  exact?: boolean;
  /** Extra path prefixes that belong to this section but don't sit under its link. */
  match?: ReadonlyArray<string>;
  /** Quick actions, in display order. */
  pages: ReadonlyArray<PageId>;
}

/** Sidebar order. */
export const SECTIONS = {
  home:        { label: 'Sky Planner', link: '/', icon: 'home', exact: true, pages: [] },
  daily:       { label: 'Daily', link: '/daily', icon: 'today', pages: ['daily', 'crTracker', 'pnrTracker'] },
  currency:    { label: 'Currencies', link: '/currency', icon: 'wallet', svgIcon: 'candle', pages: ['currency', 'currencySpent', 'wikiCurrency'] },
  item:        { label: 'Items', link: '/item', icon: 'checkroom', pages: [
    'itemGrid', 'itemTable', 'itemPreview', 'itemDye', 'itemCollection', 'itemHearts', 'itemCost', 'itemGoals', 'itemInflation',
    'suggestItem', 'wikiCosmetics'
  ] },
  spirit:      { label: 'Spirits', link: '/spirit', icon: 'person', match: ['/spirit-tree'], pages: [
    'spirits', 'regularSpirits', 'elderSpirits', 'seasonSpirits', 'seasonGuides',
    'travelingSpirits', 'specialVisits', 'elusiveSpirits', 'wikiSpirits', 'spiritGraphs', 'spiritTreeEditor'
  ] },
  wingedLight: { label: 'Winged Light', link: '/winged-light', icon: 'air', svgIcon: 'flaps', pages: ['wingedLight', 'childrenOfLight', 'wingBuffs', 'wikiWingedLight'] },
  realm:       { label: 'Realms', link: '/realm', icon: 'map', pages: ['realms', 'areas', 'sharedCreations', 'crTracker', 'pnrTracker', 'wikiRealms'] },
  season:      { label: 'Seasons', link: '/season', icon: 'ac_unit', pages: ['seasons', 'seasonOptimizer', 'seasonCalculator', 'wikiSeasons', 'eventCalendar'] },
  event:       { label: 'Events', link: '/event', icon: 'celebration', match: ['/event-instance'], pages: ['events', 'eventHistory', 'eventCalculator', 'wikiEvents', 'eventCalendar'] },
  shop:        { label: 'Shops', link: '/shop', icon: 'shopping_cart', pages: [
    'shops', 'shopEvent', 'shopCinema', 'shopConcertHall', 'shopHarmonyHall', 'shopNesting', 'shopOffice', 'shopPrairie', 'shopWonderland',
    'wikiShops'
  ] },
  friend:      { label: 'Friends', link: '/friend', icon: 'people', pages: [] },
  tool:        { label: 'Tools', link: '/tool', icon: 'build', pages: ['tools', 'quickStart', 'closet', 'collage', 'outfitVault'] },
} satisfies Record<string, ISection>;

export type SectionId = keyof typeof SECTIONS;

/** Sidebar footer order. */
export const FOOTER_PAGES: ReadonlyArray<PageId> = ['designFeedback', 'news', 'settings', 'info'];
