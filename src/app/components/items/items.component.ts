import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IItem, IItemSource, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf, NgFor, NgTemplateOutlet, LowerCasePipe } from '@angular/common';
import { ItemTypeSelectorComponent } from './item-type-selector/item-type-selector.component';
import { MatIcon } from '@angular/material/icon';
import { CheckboxComponent } from "../layout/checkbox/checkbox.component";
import { IconComponent } from '../icon/icon.component';
import { ISeason } from '@app/interfaces/season.interface';
import { IIAP } from '@app/interfaces/iap.interface';
import { IEvent, IEventInstance } from '@app/interfaces/event.interface';
import { INode } from '@app/interfaces/node.interface';
import { IItemListNode } from '@app/interfaces/item-list.interface';
import { IRealm } from '@app/interfaces/realm.interface';
import { SearchService } from '@app/services/search.service';
import { Maybe } from '@app/types/maybe';
import { ItemTypePipe } from "../../pipes/item-type.pipe";
import { CostHelper } from '@app/helpers/cost-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { CardComponent } from "../layout/card/card.component";

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
};

type FilterMaybeMap = { [key: string]: Maybe<boolean> };
type FilterMap = { [key: string]: boolean };

let itemSearchMetadata: { [key: string]: IItemSearchMetadata } | undefined;
const defaultFilters = {
  filters: { owned: undefined, favourite: undefined, limited: undefined, returned: undefined, starter: undefined, unsorted: undefined },
  currencies: { free: true, candles: true, hearts: true, ascendedCandles: true, eventCurrency: true, seasonCandles: true, seasonPass: true, seasonHearts: true, iap: true }
};

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, IconComponent, MatIcon, ItemTypeSelectorComponent, NgIf, NgbTooltip, NgFor, NgTemplateOutlet, ItemIconComponent, CheckboxComponent, ItemTypePipe, LowerCasePipe, CardComponent]
})
export class ItemsComponent {
  @Input() title = 'Items';
  @Input() type: ItemType = ItemType.Outfit;
  @Input() highlightItem?: IItem;
  @Input() action: ItemAction = 'navigate';
  @Input() foldable = false;

  @Output() readonly onItemClicked = new EventEmitter<ItemClickEvent>();
  @Output() readonly onItemsChanged = new EventEmitter<Array<IItem>>();

  types: Array<string> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.Mask, ItemType.FaceAccessory,
    ItemType.Necklace, ItemType.Hair, ItemType.Hat, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop, ItemType.Emote,
    ItemType.Stance, ItemType.Call, ItemType.Music
  ];
  typeSet = new Set(this.types);
  allItems: Array<IItem> = [];
  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};
  typesLoaded: { [key: string]: boolean } = {};

  shownItems: { [key: string]: boolean } = {};
  unfilteredItems: { [key: string]: boolean } = {};
  unfilteredItemCount: number = 0;
  shownUnlocked: number = 0;
  shownCount: number = 0;
  shownIncludesFav = false;

  isFolded = false;
  showFilters = false;
  showGeneralFilters = true;
  showCurrencyFilters = false;
  showSeasonFilters = false;
  showEventFilters = false;
  showRealmFilters = false;

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
  seasons: Array<ISeason>;
  events: Array<IEvent>;
  realms: Array<IRealm>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.seasons = this._dataService.seasonConfig.items;
    this.events = this._dataService.eventConfig.items;
    const realmGuids = new Set(['E1RwpAdA8l', 'tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77', 'GKnbJhLIRi']);
    this.realms = this._dataService.realmConfig.items.filter(r => realmGuids.has(r.guid));
    this.loadSettings();
    this.initializeItems();

    const query = _route.snapshot.queryParamMap;
    this.showFilters = query.get('f') === '1';
  }

  ngOnInit(): void {
    this.updateShownItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) { this.updateShownItems(); }
  }

  clickItem(item: IItem, event: MouseEvent) {
    if (this.action !== 'emit') { return; }
      this.onItemClicked.emit({ event, item });
  }

  beforeFold(folded: boolean): void {
    this.isFolded = folded;
  }

  // #region Toggle filters

  toggleFilters(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopImmediatePropagation();

    this.showFilters = !this.showFilters;
    const url = new URL(location.href);
    url.searchParams.set('f', this.showFilters ? '1' : '0');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
    this.updateShownItems();
  }

  onFilterNameInput(evt: Event): void {
    this.filterName = (evt.target as HTMLInputElement).value || '';
    this.updateShownItems();
  }

  toggleFilter(filter: string): void {
    this.filters[filter] = this.bumpBool(this.filters[filter]);
    this.allGeneralFiltered = this.checkAllFiltered(this.filters);
    this.saveSettings();
    this.updateShownItems();
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
    const firstCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.first);
    const lastCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.last);
    this.allCurrenciesFiltered = firstCurrenciesFiltered === lastCurrenciesFiltered ? firstCurrenciesFiltered : undefined;
    this.saveSettings();
    this.updateShownItems();
  }

  toggleCurrencyFilter(filters: FilterMap, filter: string): void {
    filters[filter] = !filters[filter];
    const firstCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.first);
    const lastCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.last);
    this.allCurrenciesFiltered = firstCurrenciesFiltered === lastCurrenciesFiltered ? firstCurrenciesFiltered : undefined;
    this.saveSettings();
    this.updateShownItems();
  }

  toggleRealmFilters(show: boolean): void {
    this.allRealmsFiltered = show;
    for (const r of this.realms) { this.filterRealms[r.guid] = show; }
    this.saveSettings();
    this.updateShownItems();
  }

  toggleRealmFilter(realm: IRealm) {
    this.filterRealms[realm.guid] = !this.filterRealms[realm.guid]
    this.allRealmsFiltered = this.checkAllFiltered(this.filterRealms);
    this.saveSettings();
    this.updateShownItems();
  }

  toggleSeasonFilters(show: boolean): void {
    this.allSeasonsFiltered = show;
    for (const s of this.seasons) { this.filterSeasons[s.guid] = show; }
    this.saveSettings();
    this.updateShownItems();
  }

  toggleSeasonFilter(season: ISeason) {
    this.filterSeasons[season.guid] = !this.filterSeasons[season.guid]
    this.allSeasonsFiltered = this.checkAllFiltered(this.filterSeasons);
    this.saveSettings();
    this.updateShownItems();
  }

  toggleEventFilters(show: boolean): void {
    this.allEventsFiltered = show;
    for (const e of this.events) { this.filterEvents[e.guid] = show; }
    this.saveSettings();
    this.updateShownItems();
  }

  toggleEventFilter(event: IEvent) {
    this.filterEvents[event.guid] = !this.filterEvents[event.guid];
    this.allEventsFiltered = this.checkAllFiltered(this.filterEvents);
    this.saveSettings();
    this.updateShownItems();
  }

  // #endregion

  resetFilters(): void {
    this.resetFilterFields();
    this.saveSettings();
    this.updateShownItems();
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

  private updateShownItems(): void {
    // Lazy load shown types
    this.typesLoaded[this.type!] = true;

    // Can't show all item types at once, becomes unresponsive.
    // Maybe if icons weren't all loaded at once/separately.
    // if (this.showFilters) { this.types.forEach(type => this.typesLoaded[type] = true); }
    // else { this.typesLoaded[this.type!] = true; }
    // const items = this.showFilters
    //   ? this.allItems
    //   : this.typeItems[this.type!] ?? [];

    this.shownItems = {};
    const items = this.typeItems[this.type!] ?? [];
    for (const item of items) {
      this.shownItems[item.guid] = true;
      this.shownCount++;
    }
    this.shownCount = items.length;
    this.shownUnlocked = this.typeUnlocked[this.type!] ?? 0;

    this.unfilteredItemCount = 0;
    this.unfilteredItems = {};
    if (this.showFilters) {
      this.initializeItemSearchMetadata();
      const matches = items.filter(item => {
        // Check filters
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
            const isSeasonNode = metadata.lastNode?.root?.spiritTree?.spirit?.type === 'Season';
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
          const isUnsorted = !item.autoUnlocked && !metadata.season && !metadata.event && !metadata.realm
          if (isUnsorted !== this.filters['unsorted']) { return false; }
        }

        return true;
      });

      if (this.filterName) {
        const itemGuids = new Set(matches.map(item => item.guid));
        const items = this._searchService.items.filter(s => s.type === 'Item' && itemGuids.has((s.data as IItem).guid));
        const searchResults = this._searchService.search(this.filterName, { limit: 999, items });
        searchResults.forEach(result => this.unfilteredItems[(result.data as IItem).guid] = true);
      } else {
        matches.forEach(item => this.unfilteredItems[item.guid] = true);
      }
      this.unfilteredItemCount = matches.length;

      // Notify listeners.
      this.onItemsChanged.emit(matches);
    } else {
      // Notify listeners.
      this.onItemsChanged.emit(items);
    }

    this._changeDetectionRef.markForCheck();
  }

  private initializeItems(): void {
    // Clear data.
    this.typeItems = {};
    this.typeUnlocked = {};
    for (const type in ItemType) {
      this.typeItems[type] = [];
      this.typeUnlocked[type] = 0;
    }

    // Load all items.
    const items = this._dataService.itemConfig.items;
    this.allItems = [];
    items.forEach(item => {
      if (!this.typeSet.has(item.type)) { return; }
      this.typeItems[item.type].push(item);
      this.allItems.push(item);
      if (item.unlocked) { this.typeUnlocked[item.type]++; }
    });

    // Sort by order.
    for (const type in ItemType) {
      ItemHelper.sortItems(this.typeItems[type]);
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
      if (!originSource && origin?.type === 'node' && origin.source.root?.spiritTree?.ts?.spirit?.season) {
        originSource = { type: 'season', source: origin.source.root.spiritTree.ts.spirit.season };
      }

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
        realm: last?.type === 'node' ? last.source.root?.spiritTree?.spirit?.area?.realm : undefined
      };
    };
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
    this.filterCurrencies = { first: {}, last: {}, ...parsed.currencies };
    for (const c in defaultFilters.currencies) {
      this.filterCurrencies.first[c] ??= true;
      this.filterCurrencies.last[c] ??= true;
    }
    const firstCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.first);
    const lastCurrenciesFiltered = this.checkAllFiltered(this.filterCurrencies.last);
    this.allCurrenciesFiltered = firstCurrenciesFiltered === lastCurrenciesFiltered ? firstCurrenciesFiltered : undefined;
    this.showCurrencyFilters = this.allCurrenciesFiltered === undefined;

    this.filterRealms = parsed.realms || {};
    this.realms.forEach(realm => this.filterRealms[realm.guid] ??= true);
    this.allRealmsFiltered = this.checkAllFiltered(this.filterRealms);
    this.showRealmFilters = this.allRealmsFiltered === undefined;

    this.filterSeasons = parsed.seasons || {};
    this.seasons.forEach(season => this.filterSeasons[season.guid] ??= true);
    this.allSeasonsFiltered = this.checkAllFiltered(this.filterSeasons);
    this.showSeasonFilters = this.allSeasonsFiltered === undefined;

    this.filterEvents = parsed.events || {};
    this.events.forEach(event => this.filterEvents[event.guid] ??= true);
    this.allEventsFiltered = this.checkAllFiltered(this.filterEvents);
    this.showEventFilters = this.allEventsFiltered === undefined;
  }

  private resetFilterFields(): void {
    this.filters = { ...defaultFilters.filters };
    this.filterCurrencies = {
      first: {
        free: true, candles: true, hearts: true, ascendedCandles: true,
        eventCurrency: true, seasonCandles: true, seasonPass: true, seasonHearts: true, iap: true
      },
      last: {
        free: true, candles: true, hearts: true, ascendedCandles: true,
        eventCurrency: true, seasonCandles: true, seasonPass: true, seasonHearts: true, iap: true
      }
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
