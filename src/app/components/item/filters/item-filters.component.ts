import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { CostHelper } from '@app/helpers/cost-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { SearchService } from '@app/services/search.service';
import { Maybe } from '@app/types/maybe';
import { CheckboxComponent } from '@app/components/shared/checkbox/checkbox.component';
import { ICost, IEvent, IItem, IItemSource, IItemSourceNode, INode, IRealm, ISeason } from 'skygame-data';

interface IItemSearchMetadata {
  item: IItem;

  /** First and last source in release order. */
  origin?: IItemSource;
  last?: IItemSource;
  lastNode?: INode;

  season?: ISeason;
  events?: Array<IEvent>;
  realm?: IRealm;
}

type FilterMaybeMap = { [key: string]: Maybe<boolean> };
type FilterMap = { [key: string]: boolean };

/** Derived from immutable game data, so it is built once per session. */
let itemSearchMetadata: { [key: string]: IItemSearchMetadata } | undefined;

const defaultFilters = {
  filters: { owned: undefined, favourite: undefined, limited: undefined, returned: undefined, starter: undefined, dyeable: undefined, unsorted: undefined },
  currencies: { free: true, candles: true, hearts: true, ascendedCandles: true, eventCurrency: true, loyaltyPoints: true, seasonCandles: true, seasonPass: true, seasonHearts: true, iap: true }
};

const generalFilters = [
  { key: 'owned', label: 'Owned' },
  { key: 'favourite', label: 'Wishlist' },
  { key: 'starter', label: 'Starter' },
  { key: 'limited', label: 'Limited' },
  { key: 'returned', label: 'Has returned' },
  { key: 'dyeable', label: 'Dyeable' },
  { key: 'unsorted', label: 'Unsorted' }
];

const currencyFilters = [
  { key: 'free', label: 'Free' },
  { key: 'candles', label: 'Candles' },
  { key: 'hearts', label: 'Hearts' },
  { key: 'ascendedCandles', label: 'Ascended candles' },
  { key: 'eventCurrency', label: 'Event currency' },
  { key: 'loyaltyPoints', label: 'Loyalty points' },
  { key: 'seasonCandles', label: 'Season candles' },
  { key: 'seasonPass', label: 'Season pass' },
  { key: 'seasonHearts', label: 'Season hearts' },
  { key: 'iap', label: 'In-app purchase' }
];

/**
 * Item filter panel: a name search plus the general, currency, season, event and
 * realm groups. It only decides which of the given items pass; what to do with
 * them is the host's business. Filter state is shared by every host through the
 * single `items.filters` localStorage entry, as it always has been.
 */
@Component({
  selector: 'app-item-filters',
  templateUrl: './item-filters.component.html',
  styleUrl: './item-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TooltipDirective, IconComponent, CheckboxComponent]
})
export class ItemFiltersComponent {
  readonly items = input.required<ReadonlyArray<IItem>>();
  /** The host owns the open/closed state so it can place the toggle itself. */
  readonly visible = input<boolean>(false);

  readonly matchedChange = output<ReadonlySet<string>>();
  readonly hideRequested = output<Event>();

  private readonly _dataService = inject(DataService);
  private readonly _searchService = inject(SearchService);

  readonly generalFilters = generalFilters;
  readonly currencyFilters = currencyFilters;

  readonly showGeneralFilters = signal(true);
  readonly showCurrencyFilters = signal(false);
  readonly showSeasonFilters = signal(false);
  readonly showEventFilters = signal(false);
  readonly showRealmFilters = signal(false);

  /** Bumped whenever a filter map changes, to recompute the matched items. */
  private readonly _filterVersion = signal(0);

  filterName = '';
  filters: FilterMaybeMap = {};
  filterCurrencies: { first: FilterMap, last: FilterMap } = { first: {}, last: {} };
  filterSeasons: FilterMap = {};
  filterEvents: FilterMap = {};
  filterRealms: FilterMap = {};

  allGeneralFiltered: Maybe<boolean>;
  allCurrenciesFiltered: Maybe<boolean>;
  allSeasonsFiltered: Maybe<boolean>;
  allEventsFiltered: Maybe<boolean>;
  allRealmsFiltered: Maybe<boolean>;

  readonly seasons: Array<ISeason>;
  readonly events: Array<IEvent>;
  readonly realms: Array<IRealm>;

  readonly matched = computed<ReadonlySet<string>>(() => {
    this._filterVersion();
    return this.computeMatched(this.items());
  });

  constructor() {
    this.seasons = this._dataService.seasonConfig.items;
    this.events = this._dataService.eventConfig.items;
    // Curated subset — Isle of Dawn through Eye of Eden. Not derivable from the
    // data, which also carries realms that were never worth filtering on.
    const realmGuids = new Set(['E1RwpAdA8l', 'tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77', 'GKnbJhLIRi']);
    this.realms = this._dataService.realmConfig.items.filter(r => realmGuids.has(r.guid));

    this.loadSettings();

    effect(() => {
      this.matchedChange.emit(this.matched());
    });
  }

  onFilterNameInput(evt: Event): void {
    this.filterName = (evt.target as HTMLInputElement).value || '';
    this.applyFilters(false);
  }

  toggleFilter(filter: string): void {
    this.filters[filter] = this.bumpBool(this.filters[filter]);
    this.allGeneralFiltered = this.checkAllFiltered(this.filters);
    this.applyFilters();
  }

  toggleCurrencyFilters(show: boolean, filters?: FilterMap): void {
    if (filters) {
      for (const c in filters) { filters[c] = show; }
    } else {
      for (const c in this.filterCurrencies.first) {
        this.filterCurrencies.first[c] = show;
        this.filterCurrencies.last[c] = show;
      }
    }
    this.updateAllCurrenciesFiltered();
    this.applyFilters();
  }

  toggleCurrencyFilter(filters: FilterMap, filter: string): void {
    filters[filter] = !filters[filter];
    this.updateAllCurrenciesFiltered();
    this.applyFilters();
  }

  toggleRealmFilters(show: boolean): void {
    this.allRealmsFiltered = show;
    for (const r of this.realms) { this.filterRealms[r.guid] = show; }
    this.applyFilters();
  }

  toggleRealmFilter(realm: IRealm): void {
    this.filterRealms[realm.guid] = !this.filterRealms[realm.guid];
    this.allRealmsFiltered = this.checkAllFiltered(this.filterRealms);
    this.applyFilters();
  }

  toggleSeasonFilters(show: boolean): void {
    this.allSeasonsFiltered = show;
    for (const s of this.seasons) { this.filterSeasons[s.guid] = show; }
    this.applyFilters();
  }

  toggleSeasonFilter(season: ISeason): void {
    this.filterSeasons[season.guid] = !this.filterSeasons[season.guid];
    this.allSeasonsFiltered = this.checkAllFiltered(this.filterSeasons);
    this.applyFilters();
  }

  toggleEventFilters(show: boolean): void {
    this.allEventsFiltered = show;
    for (const e of this.events) { this.filterEvents[e.guid] = show; }
    this.applyFilters();
  }

  toggleEventFilter(event: IEvent): void {
    this.filterEvents[event.guid] = !this.filterEvents[event.guid];
    this.allEventsFiltered = this.checkAllFiltered(this.filterEvents);
    this.applyFilters();
  }

  resetFilters(): void {
    this.resetFilterFields();
    this.applyFilters();
  }

  private applyFilters(save = true): void {
    if (save) { this.saveSettings(); }
    this._filterVersion.update(v => v + 1);
  }

  private updateAllCurrenciesFiltered(): void {
    const first = this.checkAllFiltered(this.filterCurrencies.first);
    const last = this.checkAllFiltered(this.filterCurrencies.last);
    this.allCurrenciesFiltered = first === last ? first : undefined;
  }

  private bumpBool(val: Maybe<boolean>): Maybe<boolean> {
    switch (val) {
      case undefined: return true;
      case true: return false;
      case false: return undefined;
    }
  }

  private checkAllFiltered(map: FilterMap | FilterMaybeMap): Maybe<boolean> {
    const values = Object.values(map);
    const first = values[0];
    const same = values.every(v => v === first);
    return same ? first : undefined;
  }

  private computeMatched(items: ReadonlyArray<IItem>): ReadonlySet<string> {
    this.initializeItemSearchMetadata();
    const matches = items.filter(item => {
      if (this.filters['favourite'] !== undefined) {
        if (this.filters['favourite'] !== !!item.favourited) { return false; }
      }
      if (this.filters['limited'] !== undefined) {
        const limited = item.group === 'Limited' || item.group === 'Ultimate';
        if (this.filters['limited'] !== limited) { return false; }
      }
      if (this.filters['owned'] !== undefined) {
        if (this.filters['owned'] !== !!item.unlocked) { return false; }
      }
      if (this.filters['starter'] !== undefined) {
        if (this.filters['starter'] !== !!item.autoUnlocked) { return false; }
      }

      const metadata = itemSearchMetadata![item.guid];
      if (this.filters['returned'] !== undefined) {
        const returned = item.autoUnlocked || (metadata.origin && metadata.origin.source !== metadata.last?.source);
        if (this.filters['returned'] !== returned) { return false; }
      }

      if (this.filters['dyeable'] !== undefined) {
        const dyeable = !!item.dye;
        if (this.filters['dyeable'] !== dyeable) { return false; }
      }

      // Filter by IAP
      if (this.filterCurrencies.first['iap'] === false && metadata.origin?.type === 'iap') { return false; }
      if (this.filterCurrencies.last['iap'] === false && metadata.last?.type === 'iap') { return false; }

      // Filter by currencies
      const sourceCost = (source?: IItemSource): ICost | undefined => source?.type === 'iap' ? undefined : source?.source;
      const costFirst = sourceCost(metadata.origin);
      const costLast = sourceCost(metadata.last);
      const checkCost = (cost: ICost | undefined, filters: FilterMap): boolean => {
        if (filters['candles'] === false && cost?.c) { return false; }
        if (filters['hearts'] === false && cost?.h) { return false; }
        if (filters['ascendedCandles'] === false && cost?.ac) { return false; }
        if (filters['eventCurrency'] === false && cost?.ec) { return false; }
        if (filters['loyaltyPoints'] === false && cost?.lp) { return false; }
        if (filters['seasonCandles'] === false && cost?.sc) { return false; }
        if (filters['seasonPass'] === false) {
          if (item.group === 'Ultimate') { return false; }
          if (cost && item.group === 'SeasonPass' && CostHelper.isEmpty(cost)) { return false; }
        }
        if (filters['seasonHearts'] === false && cost?.sh) { return false; }
        if (filters['free'] === false) {
          if (item.autoUnlocked) { return false; }
          const isFree = cost && CostHelper.isEmpty(cost);
          const isSeasonNode = metadata.lastNode?.root?.tree?.spirit?.type === 'Season';
          const isSeasonRootNode = isSeasonNode && metadata.lastNode!.root === metadata.lastNode;
          if (isFree && (!isSeasonNode || isSeasonRootNode)) { return false; }
        }

        return true;
      };
      if (!checkCost(costFirst, this.filterCurrencies.first)) { return false; }
      if (!checkCost(costLast, this.filterCurrencies.last)) { return false; }

      // Items from both a season and events (e.g. AURORA Encore) pass when any one of them is checked.
      if (metadata.season || metadata.events) {
        const seasonChecked = !!metadata.season && this.filterSeasons[metadata.season.guid] !== false;
        const eventChecked = !!metadata.events?.some(e => this.filterEvents[e.guid] !== false);
        if (!seasonChecked && !eventChecked) { return false; }
      }
      if (metadata.realm !== undefined && this.filterRealms[metadata.realm.guid] === false) { return false; }

      if (this.filters['unsorted'] !== undefined) {
        const isUnsorted = !item.autoUnlocked && !metadata.season && !metadata.events && !metadata.realm;
        if (isUnsorted !== this.filters['unsorted']) { return false; }
      }

      return true;
    });

    // The name filter goes through the search service so results stay fuzzy-matched.
    if (!this.filterName) { return new Set(matches.map(item => item.guid)); }

    const itemGuids = new Set(matches.map(item => item.guid));
    const searchItems = this._searchService.items.filter(s => s.type === 'Item' && itemGuids.has((s.data as IItem).guid));
    const searchResults = this._searchService.search(this.filterName, { limit: 999, items: searchItems });
    return new Set(searchResults.map(r => (r.data as IItem).guid));
  }

  private initializeItemSearchMetadata(): void {
    if (itemSearchMetadata) { return; }
    itemSearchMetadata = {};
    const items = this._dataService.itemConfig.items;
    for (const item of items) {
      const sources = ItemHelper.getItemSourcesByDate(item);
      const origin = sources.at(0);
      const last = sources.at(-1);
      const lastNode = sources.filter((s): s is IItemSourceNode => s.type === 'node').at(-1)?.source;

      // Only apply realm filters to regular spirits & elders.
      const lastNodeSpirit = last?.type === 'node' ? last.source.root?.tree?.spirit : undefined;
      const realm = lastNodeSpirit?.type === 'Regular' || lastNodeSpirit?.type === 'Elder' ? lastNodeSpirit.area?.realm : undefined;

      const nodes = [...(item.nodes ?? []), ...(item.hiddenNodes ?? [])];
      // Items introduced on traveling or returning spirit trees count towards the spirit's season.
      const season = item.season
        ?? nodes.map(n => {
          const tree = n.root?.tree;
          return tree?.spirit?.season ?? tree?.travelingSpirit?.spirit?.season ?? tree?.specialVisitSpirit?.spirit?.season;
        }).find(s => s)
        ?? item.listNodes?.map(n => n.itemList?.shop?.season).find(s => s);

      const events = new Set<IEvent>();
      nodes.forEach(n => { const e = n.root?.tree?.eventInstanceSpirit?.eventInstance?.event; if (e) { events.add(e); } });
      item.listNodes?.forEach(n => { const e = n.itemList?.shop?.event?.event; if (e) { events.add(e); } });
      item.iaps?.forEach(iap => { const e = iap.shop?.event?.event; if (e) { events.add(e); } });

      itemSearchMetadata[item.guid] = {
        item, origin, last, lastNode,
        season,
        events: events.size ? [...events] : undefined,
        realm
      };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('items.filters', JSON.stringify({
      filters: this.filters,
      currencies: this.filterCurrencies,
      realms: this.filterRealms,
      seasons: this.filterSeasons,
      events: this.filterEvents
    }));
  }

  private loadSettings(): void {
    const data = localStorage.getItem('items.filters');
    const parsed = JSON.parse(data || '{}');

    if (!data) {
      this.resetFilterFields();
      return;
    }

    this.filters = parsed.filters || {};
    for (const filter in defaultFilters.filters) { this.filters[filter] ??= undefined; }
    this.allGeneralFiltered = this.checkAllFiltered(this.filters);

    this.filterCurrencies = { first: {}, last: {}, ...parsed.currencies };
    for (const c in defaultFilters.currencies) {
      this.filterCurrencies.first[c] ??= true;
      this.filterCurrencies.last[c] ??= true;
    }
    this.updateAllCurrenciesFiltered();
    this.showCurrencyFilters.set(this.allCurrenciesFiltered === undefined);

    this.filterRealms = parsed.realms || {};
    this.realms.forEach(realm => this.filterRealms[realm.guid] ??= true);
    this.allRealmsFiltered = this.checkAllFiltered(this.filterRealms);
    this.showRealmFilters.set(this.allRealmsFiltered === undefined);

    this.filterSeasons = parsed.seasons || {};
    this.seasons.forEach(season => this.filterSeasons[season.guid] ??= true);
    this.allSeasonsFiltered = this.checkAllFiltered(this.filterSeasons);
    this.showSeasonFilters.set(this.allSeasonsFiltered === undefined);

    this.filterEvents = parsed.events || {};
    this.events.forEach(event => this.filterEvents[event.guid] ??= true);
    this.allEventsFiltered = this.checkAllFiltered(this.filterEvents);
    this.showEventFilters.set(this.allEventsFiltered === undefined);
  }

  private resetFilterFields(): void {
    this.filterName = '';
    this.filters = { ...defaultFilters.filters };
    this.filterCurrencies = {
      first: { ...defaultFilters.currencies },
      last: { ...defaultFilters.currencies }
    };
    this.filterRealms = {};
    this.realms.forEach(realm => this.filterRealms[realm.guid] = true);
    this.filterSeasons = {};
    this.seasons.forEach(season => this.filterSeasons[season.guid] = true);
    this.filterEvents = {};
    this.events.forEach(event => this.filterEvents[event.guid] = true);

    this.allGeneralFiltered = undefined;
    this.allCurrenciesFiltered = true;
    this.allRealmsFiltered = true;
    this.allSeasonsFiltered = true;
    this.allEventsFiltered = true;
  }
}
