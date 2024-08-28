import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, IItemSource, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';
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

interface IItemSearchMetadata {
  item: IItem;

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

type FilterMap = { [key: string]: boolean | undefined };

let itemSearchMetadata: { [key: string]: IItemSearchMetadata } | undefined;

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, IconComponent, MatIcon, ItemTypeSelectorComponent, NgIf, NgbTooltip, NgFor, NgTemplateOutlet, ItemIconComponent, CheckboxComponent]
})
export class ItemsComponent {
  type?: ItemType;

  // Item details.
  selectedItem?: IItem;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  unfilteredItems: { [key: string]: boolean } = {};
  unfilteredItemCount: number = 0;
  shownUnlocked: number = 0;
  shownCount: number = 0;
  shownIncludesFav = false;

  showFilters = false;
  hasGeneralFilters = false;
  showGeneralFilters = true;
  showSeasonFilters = false;
  showEventFilters = false;
  showRealmFilters = false;

  filterName = '';
  filters: FilterMap = {};
  filterSeasons: FilterMap = {};
  filterEvents: FilterMap = {};
  filterRealms: FilterMap = {};
  allSeasonsFiltered: boolean | undefined;
  allEventsFiltered: boolean | undefined;
  allRealmsFiltered: boolean | undefined;
  hasSeasonFilters = false;
  hasEventFilters = false;
  hasRealmFilters = false;
  seasons: Array<ISeason>;
  events: Array<IEvent>;
  realms: Array<IRealm>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _searchService: SearchService,
    private readonly _storageService: StorageService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.seasons = this._dataService.seasonConfig.items;
    this.events = this._dataService.eventConfig.items;
    const realmGuids = new Set(['E1RwpAdA8l', 'tuaosLljJS', 'mz64Wq0_df', 'VtkTo1WWuD', 'rAjzHXfPpb', 'y-6n1F5E77', 'GKnbJhLIRi']);
    this.realms = this._dataService.realmConfig.items.filter(r => realmGuids.has(r.guid));
    this.loadSettings();
    this.initializeItems();

    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;
    this.type = type as ItemType || ItemType.Outfit;

    this.updateShownItems();

    // Select item from query.
    const itemGuid = query.get('item') || '';
    if (itemGuid) {
      this.selectedItem = this._dataService.guidMap.get(itemGuid) as IItem;
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.updateShownItems();
  }

  onFilterNameInput(evt: Event): void {
    this.filterName = (evt.target as HTMLInputElement).value || '';
    this.updateShownItems();
  }

  toggleFilter(filter: string) {
    const val = this.bumpBool(this.filters[filter]);
    this.filters[filter] = val;
    this.hasGeneralFilters = Object.values(this.filters).some(v => v !== undefined);
    this.saveSettings();
    this.updateShownItems();
  }

  toggleRealmFilters(): void {
    const val = this.bumpBool(this.allRealmsFiltered);
    for (const realm of this.realms) { this.filterRealms[realm.guid] = val; }
    this.checkAllRealmsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  toggleRealmFilter(realm: IRealm) {
    const val = this.bumpBool(this.filterRealms[realm.guid]);
    this.filterRealms[realm.guid] = val;
    this.checkAllRealmsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  toggleSeasonFilters(): void {
    const val = this.bumpBool(this.allSeasonsFiltered);
    for (const season of this.seasons) { this.filterSeasons[season.guid] = val; }
    this.checkAllSeasonsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  toggleSeasonFilter(season: ISeason) {
    const val = this.bumpBool(this.filterSeasons[season.guid]);
    this.filterSeasons[season.guid] = val;
    this.checkAllSeasonsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  toggleEventFilters(): void {
    const val = this.bumpBool(this.allEventsFiltered);
    for (const event of this.events) { this.filterEvents[event.guid] = val; }
    this.checkAllEventsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  toggleEventFilter(event: IEvent) {
    const val = this.bumpBool(this.filterEvents[event.guid]);
    this.filterEvents[event.guid] = val;
    this.checkAllEventsFiltered();
    this.saveSettings();
    this.updateShownItems();
  }

  clearFilters(): void {
    this.filters = {};
    this.filterSeasons = {};
    this.filterEvents = {};
    this.allSeasonsFiltered = undefined;
    this.allEventsFiltered = undefined;
    this.hasGeneralFilters = false;
    this.saveSettings();
    this.updateShownItems();
  }

  private bumpBool(val: boolean | undefined): boolean | undefined {
    switch (val) {
      case undefined: return true;
      case true: return false;
      case false: return undefined;
    }
  }

  private checkAllSeasonsFiltered(): void {
    const val = this.checkAllFiltered(this.filterSeasons);
    this.allSeasonsFiltered = val ?? undefined;
    this.hasSeasonFilters = val !== undefined;
  }

  private checkAllEventsFiltered(): void {
    const val = this.checkAllFiltered(this.filterEvents);
    this.allEventsFiltered = val ?? undefined;
    this.hasEventFilters = val !== undefined;
  }

  private checkAllRealmsFiltered(): void {
    const val = this.checkAllFiltered(this.filterRealms);
    this.allRealmsFiltered = val ?? undefined;
    this.hasRealmFilters = val !== undefined
  }

  private checkAllFiltered(map: FilterMap): boolean | undefined | null {
    const values = Object.values(map);
    const first = values[0];
    const same = values.every(v => v === first);
    return same ? first : null;
  }

  private updateShownItems(): void {
    this.shownItems = this.typeItems[this.type!] ?? [];
    this.shownCount = this.shownItems.length;
    this.shownUnlocked = this.typeUnlocked[this.type!] ?? 0;

    this.unfilteredItemCount = 0;
    this.unfilteredItems = {};
    if (this.showFilters) {
      this.initializeItemSearchMetadata();
      const hasSeasonChecked = Object.values(this.filterSeasons).some(v => v === true);
      const hasEventChecked = Object.values(this.filterEvents).some(v => v === true);
      const hasRealmChecked = Object.values(this.filterRealms).some(v => v === true);

      const matches = this.shownItems.filter(item => {
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
        if (this.filters['iap'] !== undefined) {
          if (this.filters['iap'] !== !!item.iaps?.length) { return false; }
        }

        const metadata = itemSearchMetadata![item.guid];
        if (this.filters['returned'] !== undefined) {
          const returned = metadata.origin && metadata.origin.source !== metadata.last?.source;
          if (this.filters['returned'] !== returned) { return false; }
        }

        // Check season, event & realm
        if (item.season !== undefined && this.filterSeasons[item.season.guid] === false) { return false; }
        if (metadata.event !== undefined && this.filterEvents[metadata.event.guid] === false) { return false; }
        if (metadata.realm !== undefined && this.filterRealms[metadata.realm.guid] === false) { return false; }

        const shouldFilterBySeason = (!item.season || this.filterSeasons[item.season.guid] !== true);
        const shouldFilterByEvent = (!metadata.event || this.filterEvents[metadata.event.guid] !== true);
        const shouldFilterByRealm = (!metadata.realm || this.filterRealms[metadata.realm.guid] !== true);

        if (hasSeasonChecked && !shouldFilterBySeason) { return true; }
        if (hasEventChecked && !shouldFilterByEvent) { return true; }
        if (hasRealmChecked && !shouldFilterByRealm) { return true; }
        return !hasSeasonChecked && !hasEventChecked && !hasRealmChecked;
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
    }

    this._changeDetectionRef.markForCheck();
  }

  onTypeChanged(type: ItemType): void {
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['type'] = type;
    this.selectedItem ? queryParams['item'] = this.selectedItem.guid : delete queryParams['item'];

    void this._router.navigate([], { queryParams, replaceUrl: true });
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
    items.forEach(item => {
      this.typeItems[item.type].push(item);
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
      const originSource = ItemHelper.geSourceOrigin(origin);
      const last = ItemHelper.getItemSource(item, true);
      const lastSource = ItemHelper.geSourceOrigin(last);

      // Note: picking event by last instance, to account for the weird cases like all the different Summer events.
      itemSearchMetadata[item.guid] = {
        item, origin, last,
        lastNode: item.nodes?.at(-1),
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
      seasons: this.filterSeasons,
      events: this.filterEvents,
      realms: this.filterRealms
    }));
  }

  private loadSettings(): void {
    const data = JSON.parse(localStorage.getItem('items.filters') || '{}');
    this.filters = data.filters || {};

    this.filterSeasons = data.seasons || {};
    this.seasons.forEach(season => this.filterSeasons[season.guid] ??= undefined);
    this.checkAllSeasonsFiltered();
    if (this.hasSeasonFilters) { this.showSeasonFilters = true;}

    this.filterEvents = data.events || {};
    this.events.forEach(event => this.filterEvents[event.guid] ??= undefined);
    this.checkAllEventsFiltered();
    if (this.hasEventFilters) { this.showEventFilters = true;}

    this.filterRealms = data.realms || {};
    this.realms.forEach(realm => this.filterRealms[realm.guid] ??= undefined);
    this.checkAllRealmsFiltered();
    if (this.hasRealmFilters) { this.showRealmFilters = true;}
  }
}
