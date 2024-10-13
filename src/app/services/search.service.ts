import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { DataService } from './data.service';
import { NavigationHelper } from '../helpers/navigation-helper';
import { IItem, ItemType } from '../interfaces/item.interface';
import { ISpirit } from '../interfaces/spirit.interface';
import { ISeason } from '../interfaces/season.interface';
import { IEvent } from '../interfaces/event.interface';
import { IRealm } from '../interfaces/realm.interface';
import { IArea } from '../interfaces/area.interface';

export type SearchType = 'Item' | 'Spirit' | 'Season' | 'Event' | 'Realm' | 'Area' | 'Page';

export interface ISearchOptions {
  /** Only search in these items. */
  items?: Array<ISearchItem<unknown>>;
  /** Only search for the given data types. */
  types?: Array<SearchType>;
  /** Maximum results. Defaults to `25`. */
  limit?: number;
}

export interface ISearchItemOptions extends ISearchOptions {
  items?: Array<ISearchItem<IItem>>;
  itemTypes?: Array<ItemType>;
  hasIcon?: boolean;
}

export interface ISearchItem<T> {
  name: string;
  type: SearchType;
  data: T;
  search: string | string[] | Fuzzysort.Prepared;
  route?: Array<any>;
  queryParams?: Params;

  highlighted?: string;
  target?: string;
  score?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  _items: Array<ISearchItem<unknown>>;

  constructor(private readonly _dataService: DataService) {
    this._items = this.initializeItems();
  }

  get items(): ReadonlyArray<ISearchItem<unknown>> {
    return this._items;
  }

  /** Search for anything. Use options to limit results. */
  search(search: string, options: ISearchOptions): Array<ISearchItem<unknown>> {
    if (!search) { return []; }

    let items = options?.items || this._items;

    // Filter by type.
    const types = new Set(options?.types || []);
    if (types.size) { items = items.filter(item => types.has(item.type)); }

    // Search for string.
    const searchResults = fuzzysort.go(search, items, {
      key: 'search',
      limit: options?.limit ?? 25
    });

    // Map search data to object.
    const results = searchResults.map(result => {
      result.obj.highlighted = fuzzysort.highlight(result, '<b>', '</b>') ?? '';
      result.obj.target = result.target;
      result.obj.score = result.score;
      this.setItemLink(result.obj);
      return result.obj;
    });

    return results;
  }

  /** Search for items. */
  searchItems(search: string, options: ISearchItemOptions): Array<ISearchItem<IItem>> {
    options ||= {};

    // Filter search items.
    options.items ||= this._items.filter(item => item.type === 'Item') as Array<ISearchItem<IItem>>;
    if (options.hasIcon) { options.items = options.items.filter(item => item.data.icon); }

    return this.search(search, options) as Array<ISearchItem<IItem>>;
  }

  setItemLink(item: ISearchItem<unknown>): void {
    item.route = undefined;
    item.queryParams = undefined;

    switch (item.type) {
      case 'Item':
        const target = NavigationHelper.getItemLink(item.data as IItem);
        item.route = target?.route;
        item.queryParams = target?.extras?.queryParams || undefined;
        break;
      case 'Spirit':
        const spirit = item.data as ISpirit;
        item.route = ['/spirit', spirit.guid];
        break;
      case 'Season':
        const season = item.data as ISeason;
        item.route = ['/season', season.guid];
        break;
      case 'Event':
        const  event = item.data as IEvent;
        item.route = ['/event', event.guid];
        break;
      case 'Realm':
        const realm = item.data as IRealm;
        item.route = ['/realm', realm.guid];
        break;
      case 'Area':
        const area = item.data as IRealm;
        item.route = ['/area', area.guid];
        break;
      case 'Page':
        item.route = [item.data as string];
        break;
    }
  }

  private initializeItems(): Array<ISearchItem<unknown>> {
    const items: Array<ISearchItem<unknown>> = [];
    // Add items.
    items.push(...this._dataService.itemConfig.items.filter(item => {
      if (item.type === 'Spell' || item.type === 'Quest' || item.type === 'Special' || item.type === 'WingBuff') { return; }
      if (item.type === 'Emote' && item.level! > 1) { return; }
      return true;
    }).map(item => {
      return { name: item.name, type: 'Item', data: item, search: item.name } as ISearchItem<IItem>;
    }));

    // Add spirits.
    items.push(...this._dataService.spiritConfig.items.map(spirit => {
      return { name: spirit.name, type: 'Spirit', data: spirit, search: spirit.name } as ISearchItem<ISpirit>;
    }));

    // Add seasons
    items.push(...this._dataService.seasonConfig.items.map(season => {
      return { name: season.name, type: 'Season', data: season, search: season.name } as ISearchItem<ISeason>;
    }));

    // Add events
    this._dataService.eventConfig.items.forEach(event => {
      const names = [...new Set([event.name, ...event.instances?.map(instance => instance.name) || []])];
      items.push(...names.map(n => ({ name: n, type: 'Event', data: event, search: n } as ISearchItem<IEvent>)));
    })

    // Add realms
    items.push(...this._dataService.realmConfig.items.map(realm => {
      return { name: realm.name, type: 'Realm', data: realm, search: realm.name } as ISearchItem<IRealm>;
    }));

    // Add areas
    items.push(...this._dataService.areaConfig.items.map(area => {
      return { name: area.name, type: 'Area', data: area, search: area.name } as ISearchItem<IArea>;
    }));

    // Add pages
    items.push(
      { name: 'Currencies', type: 'Page', data: '/currency', search: 'Currencies' },
      { name: 'Spent currency', type: 'Page', data: '/currency/spent', search: 'Spent currency' },
      { name: 'Events', type: 'Page', data: '/event', search: 'Events' },
      { name: 'Event history', type: 'Page', data: '/event/history', search: 'Event history' },
      { name: 'Event calculator', type: 'Page', data: '/event-calculator', search: 'Event calculator' },
      { name: 'Items', type: 'Page', data: '/item', search: 'Items' },
      { name: 'Item collections', type: 'Page', data: '/item/collection', search: 'Item collections' },
      { name: 'Item field guide', type: 'Page', data: '/item/field-guide', search: 'Item field guide' },
      { name: 'Item inflation', type: 'Page', data: '/item/inflation', search: 'Item inflation' },
      { name: 'Item unlock calculator', type: 'Page', data: '/item/unlock-calculator', search: 'Item unlock calculator' },
      { name: 'Realms', type: 'Page', data: '/realm', search: 'Realms' },
      { name: 'Areas', type: 'Page', data: '/area', search: 'Areas' },
      { name: 'Seasons', type: 'Page', data: '/season', search: 'Seasons' },
      { name: 'Season calculator', type: 'Page', data: '/season-calculator', search: 'Season calculator' },
      { name: 'Permanent shops', type: 'Page', data: '/shop', search: 'Permanent shops' },
      { name: 'Shops - Aviary Event Store', type: 'Page', data: '/shop/event', search: 'Aviary Event Store' },
      { name: 'Shops - Concert Hall', type: 'Page', data: '/shop/concert-hall', search: 'Concert Hall' },
      { name: 'Shops - Harmony Hall', type: 'Page', data: '/shop/harmony', search: 'Harmony Hall' },
      { name: 'Shops - Nesting Workshop', type: 'Page', data: '/shop/nesting', search: 'Nesting Workshop' },
      { name: 'Shops - Office', type: 'Page', data: '/shop/office', search: 'Office' },
      { name: 'Spirits', type: 'Page', data: '/spirits', search: 'Spirits' },
      { name: 'Elusive spirits', type: 'Page', data: '/spirit/elusive', search: 'Elusive spirits' },
      { name: 'Traveling spirits', type: 'Page', data: '/ts', search: 'Traveling spirits' },
      { name: 'Special visits', type: 'Page', data: '/rs', search: 'Special visits' },
      { name: 'Winged light', type: 'Page', data: '/winged-light', search: 'Winged light' },
      { name: 'Wing buffs', type: 'Page', data: '/wing-buff', search: 'Wing buffs' },
      { name: 'Children of Light', type: 'Page', data: '/col', search: 'Children of Light' },
      { name: 'Outfit request - Closet', type: 'Page', data: '/outfit-request/closet', search: 'Outfit request - Closet' },
      { name: 'Outfit request - Request', type: 'Page', data: '/outfit-request/request', search: 'Outfit request - Request' },
      { name: 'Outfit vault', type: 'Page', data: '/outfit-request/vault', search: 'Outfit vault' },
      { name: `What's new`, type: 'Page', data: '/news', search: `What's news` },
      { name: 'Settings', type: 'Page', data: '/settings', search: 'Settings' },
      { name: 'Info', type: 'Page', data: '/credits', search: 'Info' },
      { name: 'Credits', type: 'Page', data: '/credits', search: 'Credits' },
      { name: 'Privacy Policy', type: 'Page', data: '/privacy', search: 'Privacy Policy' }
    );

    // Prepare search strings.
    items.forEach(item => {
      if (typeof(item.search) !== 'string') { return; }
      item.search = fuzzysort.prepare(item.search);
    });

    return items;
  }
}
