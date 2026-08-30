import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemTypeSelectorComponent } from '@app/components/items/item-type-selector/item-type-selector.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { CostHelper } from '@app/helpers/cost-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { DataService } from '@app/services/data.service';
import { SearchService } from '@app/services/search.service';
import { Maybe } from '@app/types/maybe';
import { AtmosCheckboxComponent } from '@app/redesign/shared/checkbox/atmos-checkbox.component';
import { AtmosFoldableCardComponent } from '@app/redesign/shared/foldable-card/atmos-foldable-card.component';
import { ICost, IEvent, IEventInstance, IIAP, IItem, IItemListNode, IItemSource, INode, IRealm, ISeason, ItemSubicon, ItemType } from 'skygame-data';

export type ItemAction = 'navigate' | 'emit';
export type ItemClickEvent = { event: MouseEvent, item: IItem };

interface IItemSearchMetadata {
  item: IItem;

  firstNode?: INode;
  firstListNode?: IItemListNode;
  firstIap?: IIAP;

  lastNode?: INode;
  lastListNode?: IItemListNode;
  lastIap?: IIAP;

  origin?: IItemSource;
  last?: IItemSource;

  season?: ISeason;
  event?: IEvent;
  eventInstance?: IEventInstance;
  realm?: IRealm;
}

type FilterMaybeMap = { [key: string]: Maybe<boolean> };
type FilterMap = { [key: string]: boolean };

/** Derived from immutable game data, so it is built once per session. */
let itemSearchMetadata: { [key: string]: IItemSearchMetadata } | undefined;

const defaultFilters = {
  filters: { owned: undefined, favourite: undefined, limited: undefined, returned: undefined, starter: undefined, dyeable: undefined, unsorted: undefined },
  currencies: { free: true, candles: true, hearts: true, ascendedCandles: true, eventCurrency: true, seasonCandles: true, seasonPass: true, seasonHearts: true, iap: true }
};

const generalFilters = [
  { key: 'owned', label: 'Owned' },
  { key: 'favourite', label: 'Favourited' },
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
  { key: 'seasonCandles', label: 'Season candles' },
  { key: 'seasonPass', label: 'Season pass' },
  { key: 'seasonHearts', label: 'Season hearts' },
  { key: 'iap', label: 'In-app purchase' }
];

const itemSubIcons: Array<ItemSubicon> = ['type', 'season', 'elder', 'iap', 'favourite', 'limited'];

interface FilterResult {
  shownCount: number;
  shownUnlocked: number;
  matched: ReadonlySet<string>;
  matchedItems: Array<IItem>;
}

/**
 * Atmospheric item browser / picker: a type selector, a filter panel and a grid
 * of item icons. In `navigate` mode icons link to the item page; in `emit` mode
 * clicks are surfaced through `(itemClicked)` so the host can consume them.
 */
@Component({
  selector: 'app-atmos-item-picker',
  templateUrl: './atmos-item-picker.component.html',
  styleUrl: './atmos-item-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon, LowerCasePipe, ItemTypePipe, TooltipDirective,
    IconComponent, ItemIconComponent, ItemTypeSelectorComponent,
    AtmosCheckboxComponent, AtmosFoldableCardComponent
  ]
})
export class AtmosItemPickerComponent {
  readonly title = input<string>('Items');
  readonly type = input<ItemType>(ItemType.Outfit);
  readonly highlightItem = input<IItem | undefined>(undefined);
  readonly selectedItems = input<ReadonlyArray<IItem> | undefined>(undefined);
  readonly opaqueItems = input<boolean>(false);
  readonly action = input<ItemAction>('navigate');
  readonly foldable = input<boolean>(false);
  readonly maxHeight = input<string | undefined>(undefined);

  readonly typeChanged = output<ItemType>();
  readonly itemClicked = output<ItemClickEvent>();
  readonly itemsChanged = output<Array<IItem>>();

  private readonly _dataService = inject(DataService);
  private readonly _searchService = inject(SearchService);
  private readonly _route = inject(ActivatedRoute);

  /** Selected type; seeded from the input but owned by the type selector afterwards. */
  readonly activeType = linkedSignal<ItemType>(() => this.type());

  readonly generalFilters = generalFilters;
  readonly currencyFilters = currencyFilters;
  readonly itemSubIcons = itemSubIcons;

  readonly types: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask, ItemType.FaceAccessory,
    ItemType.Necklace, ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop, ItemType.Emote,
    ItemType.Stance, ItemType.Call, ItemType.Music
  ];

  readonly folded = signal(false);
  readonly showFilters = signal(false);
  readonly showGeneralFilters = signal(true);
  readonly showCurrencyFilters = signal(false);
  readonly showSeasonFilters = signal(false);
  readonly showEventFilters = signal(false);
  readonly showRealmFilters = signal(false);

  /** Bumped whenever a filter map changes, to recompute the shown items. */
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

  private readonly _typeSet: Set<ItemType>;
  private readonly _typeItems: { [key: string]: Array<IItem> } = {};
  private readonly _typeUnlocked: { [key: string]: number } = {};

  /** Types rendered at least once, so switching back to one is instant. */
  readonly loadedTypes = signal<ReadonlySet<ItemType>>(new Set());

  readonly selectedItemSet = computed<ReadonlySet<string>>(() => {
    const items = this.selectedItems();
    return items ? new Set(items.map(i => i.guid)) : new Set();
  });

  private readonly _result = computed<FilterResult>(() => {
    this._filterVersion();
    return this.computeShownItems(this.activeType());
  });

  readonly shownCount = computed<number>(() => this._result().shownCount);
  readonly shownUnlocked = computed<number>(() => this._result().shownUnlocked);
  readonly matchedCount = computed<number>(() => this._result().matched.size);
  readonly matchedItems = computed<ReadonlySet<string>>(() => this._result().matched);
  readonly hasActiveFilters = computed<boolean>(() => this.shownCount() !== this.matchedCount());

  constructor() {
    this.seasons = this._dataService.seasonConfig.items;
    this.events = this._dataService.eventConfig.items;
    const realmGuids = new Set(['E1RwpAdA8l', 'tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77', 'GKnbJhLIRi']);
    this.realms = this._dataService.realmConfig.items.filter(r => realmGuids.has(r.guid));

    this._typeSet = new Set(this.types);
    this.initializeItems();
    this.loadSettings();

    this.showFilters.set(this._route.snapshot.queryParamMap.get('f') === '1');

    effect(() => {
      const type = this.activeType();
      if (!this.loadedTypes().has(type)) {
        this.loadedTypes.update(set => new Set(set).add(type));
      }
      this.itemsChanged.emit(this._result().matchedItems);
    });
  }

  itemsOfType(type: ItemType): ReadonlyArray<IItem> {
    return this._typeItems[type] ?? [];
  }

  onTypeChanged(type: ItemType): void {
    this.activeType.set(type);
    this.typeChanged.emit(type);
  }

  clickItem(item: IItem, event: MouseEvent): void {
    if (this.action() !== 'emit') { return; }
    this.itemClicked.emit({ event, item });
  }

  toggleFilters(evt: Event): void {
    evt.preventDefault();
    evt.stopImmediatePropagation();

    const show = !this.showFilters();
    this.showFilters.set(show);

    const url = new URL(location.href);
    url.searchParams.set('f', show ? '1' : '0');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
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

  private computeShownItems(type: ItemType): FilterResult {
    const items = this._typeItems[type] ?? [];

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
      if (this.filterCurrencies.first['iap'] === false && metadata.last?.type === 'iap') { return false; }
      if (this.filterCurrencies.last['iap'] === false && metadata.last?.type === 'iap') { return false; }

      // Filter by currencies
      const costFirst = metadata.origin?.type === 'node' ? metadata.firstNode : metadata.origin?.type === 'list' ? metadata.firstListNode : undefined;
      const costLast = metadata.last?.type === 'node' ? metadata.lastNode : metadata.last?.type === 'list' ? metadata.lastListNode : undefined;
      const checkCost = (cost: ICost | undefined, filters: FilterMap): boolean => {
        if (filters['candles'] === false && cost?.c) { return false; }
        if (filters['hearts'] === false && cost?.h) { return false; }
        if (filters['ascendedCandles'] === false && cost?.ac) { return false; }
        if (filters['eventCurrency'] === false && cost?.ec) { return false; }
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

      // Filter out unchecked season/event/realm.
      if (metadata.season !== undefined && this.filterSeasons[metadata.season.guid] === false) { return false; }
      if (metadata.event !== undefined && this.filterEvents[metadata.event.guid] === false) { return false; }
      if (metadata.realm !== undefined && this.filterRealms[metadata.realm.guid] === false) { return false; }

      if (this.filters['unsorted'] !== undefined) {
        const isUnsorted = !item.autoUnlocked && !metadata.season && !metadata.event && !metadata.realm;
        if (isUnsorted !== this.filters['unsorted']) { return false; }
      }

      return true;
    });

    // The name filter goes through the search service so results stay fuzzy-matched.
    let matched: Set<string>;
    if (this.filterName) {
      const itemGuids = new Set(matches.map(item => item.guid));
      const searchItems = this._searchService.items.filter(s => s.type === 'Item' && itemGuids.has((s.data as IItem).guid));
      const searchResults = this._searchService.search(this.filterName, { limit: 999, items: searchItems });
      matched = new Set(searchResults.map(r => (r.data as IItem).guid));
    } else {
      matched = new Set(matches.map(item => item.guid));
    }

    return {
      shownCount: items.length,
      shownUnlocked: this._typeUnlocked[type] ?? 0,
      matched,
      matchedItems: matches
    };
  }

  private initializeItems(): void {
    for (const type in ItemType) {
      this._typeItems[type] = [];
      this._typeUnlocked[type] = 0;
    }

    for (const item of this._dataService.itemConfig.items) {
      if (!this._typeSet.has(item.type)) { continue; }
      this._typeItems[item.type].push(item);
      if (item.unlocked) { this._typeUnlocked[item.type]++; }
    }

    for (const type in ItemType) {
      ItemHelper.sortItems(this._typeItems[type]);
    }
  }

  private initializeItemSearchMetadata(): void {
    if (itemSearchMetadata) { return; }
    itemSearchMetadata = {};
    const items = this._dataService.itemConfig.items;
    for (const item of items) {
      const origin = ItemHelper.getItemSource(item);
      let originSource = ItemHelper.geSourceOrigin(origin);
      const last = ItemHelper.getItemSource(item, true);
      const lastSource = ItemHelper.geSourceOrigin(last);

      // Account for new TS items. Consider them as season items.
      if (!originSource && origin?.type === 'node' && origin.source.root?.tree?.travelingSpirit?.spirit?.season) {
        originSource = { type: 'season', source: origin.source.root.tree.travelingSpirit.spirit.season };
      }

      // Only apply realm filters to regular spirits & elders.
      const lastNodeSpirit = last?.type === 'node' ? last.source.root?.tree?.spirit : undefined;
      const realm = lastNodeSpirit?.type === 'Regular' || lastNodeSpirit?.type === 'Elder' ? lastNodeSpirit.area?.realm : undefined;

      // Note: picking event by last instance, to account for the weird cases like all the different Summer events.
      itemSearchMetadata[item.guid] = {
        item, origin, last,
        firstNode: item.hiddenNodes?.at(0) ?? item.nodes?.at(0),
        firstListNode: item.listNodes?.at(0),
        firstIap: item.iaps?.at(0),
        lastNode: item.nodes?.at(-1) ?? item.hiddenNodes?.at(-1),
        lastListNode: item.listNodes?.at(-1),
        lastIap: item.iaps?.at(-1),
        event: lastSource?.type === 'event' ? lastSource.source.event : undefined,
        eventInstance: lastSource?.type === 'event' ? lastSource.source : undefined,
        season: originSource?.type === 'season' ? originSource.source : undefined,
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
