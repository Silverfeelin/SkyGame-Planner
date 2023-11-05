import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { DataService } from './data.service';
import { NavigationHelper } from '../helpers/navigation-helper';
import { IItem, ItemType } from '../interfaces/item.interface';
import { ISpirit } from '../interfaces/spirit.interface';
import { ISeason } from '../interfaces/season.interface';
import { IEvent } from '../interfaces/event.interface';

type SearchType = 'Item' | 'Spirit' | 'Season' | 'Event';

export interface ISearchOptions {
  /** Only search in these items. */
  items?: Array<ISearchItem<unknown>>;
  /** Only search  */
  types?: Array<SearchType>;
  key?: string;
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
  search: string | Fuzzysort.Prepared;
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

  /** Search for anything. Use options to limit results. */
  search(search: string, options: ISearchOptions): Array<ISearchItem<unknown>> {
    if (!search) { return []; }

    let items = options?.items || this._items;

    // Filter by type.
    const types = new Set(options?.types || []);
    if (types.size) { items = items.filter(item => types.has(item.type)); }

    // Search for string.
    const searchResults = fuzzysort.go(search, items, {
      key: options?.key ?? 'search',
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
  searchItems(search:  string, options: ISearchItemOptions): Array<ISearchItem<IItem>> {
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
    items.push(...this._dataService.spiritConfig.items.filter(spirit => {
      return spirit.type !== 'Special' && spirit.type !== 'Event';
    }).map(spirit => {
      return { name: spirit.name, type: 'Spirit', data: spirit, search: spirit.name } as ISearchItem<ISpirit>;
    }));

    // Add seasons
    items.push(...this._dataService.seasonConfig.items.map(season => {
      return { name: season.name, type: 'Season', data: season, search: season.name } as ISearchItem<ISeason>;
    }));

    // Add events
    items.push(...this._dataService.eventConfig.items.map(event => {
      return { name: event.name, type: 'Event', data: event, search: event.name } as ISearchItem<IEvent>;
    }));

    // Prepare search strings.
    items.forEach(item => {
      if (typeof(item.search) !== 'string') { return; }
      item.search = fuzzysort.prepare(item.search);
    });

    return items;
  }
}
