import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { DataService } from './data.service';
import { NavigationHelper } from '../helpers/navigation-helper';
import { IItem } from '../interfaces/item.interface';

export interface ISearchOptions {
  types?: Array<string>;
  key?: string;
  limit?: number;
}

export interface ISearchItem {
  name: string;
  type: string;
  data: any;
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
  _items: Array<ISearchItem>;

  constructor(private readonly _dataService: DataService) {
    this._items = this.initializeItems();
  }

  search(search: string, options: ISearchOptions): Array<ISearchItem> {
    if (!search) { return []; }
    const types = new Set(options?.types || []);
    const items = types.size ? this._items.filter(item => types.has(item.type)) : this._items;

    const searchResults = fuzzysort.go(search, items, {
      key: options?.key ?? 'search',
      limit: options?.limit ?? 25
    });

    const results = searchResults.map(result => {
      result.obj.highlighted = fuzzysort.highlight(result, '<b>', '</b>') ?? '';
      result.obj.target = result.target;
      result.obj.score = result.score;
      this.setItemLink(result.obj);
      return result.obj;
    });

    return results;
  }


  setItemLink(item: ISearchItem): void {
    item.route = undefined;
    item.queryParams = undefined;

    switch (item.type) {
      case 'Item':
        const target = NavigationHelper.getItemLink(item.data as IItem);
        item.route = target?.route;
        item.queryParams = target?.extras?.queryParams || undefined;
        break;
      case 'Spirit':
        item.route = ['/spirit', item.data.guid];
        break;
      case 'Season':
        item.route = ['/season', item.data.guid];
        break;
      case 'Event':
        item.route = ['/event', item.data.guid];
        break;
    }
  }


  private initializeItems(): Array<ISearchItem> {
    const items: Array<ISearchItem> = [];
    // Add items.
    items.push(...this._dataService.itemConfig.items.filter(item => {
      if (item.type === 'Spell' || item.type === 'Quest' || item.type === 'Special') { return; }
      if (item.type === 'Emote' && item.level! > 1) { return; }
      return true;
    }).map(item => {
      return { name: item.name, type: 'Item', data: item, search: item.name }
    }));

    // Add spirits.
    items.push(...this._dataService.spiritConfig.items.filter(spirit => {
      return spirit.type !== 'Special' && spirit.type !== 'Event';
    }).map(spirit => {
      return { name: spirit.name, type: 'Spirit', data: spirit, search: spirit.name }
    }));

    // Add seasons
    items.push(...this._dataService.seasonConfig.items.map(season => {
      return { name: season.name, type: 'Season', data: season, search: season.name }
    }));

    // Add events
    items.push(...this._dataService.eventConfig.items.map(event => {
      return { name: event.name, type: 'Event', data: event, search: event.name }
    }));

    // Prepare search strings.
    items.forEach(item => {
      if (typeof(item.search) !== 'string') { return; }
      item.search = fuzzysort.prepare(item.search);
    });

    return items;
  }
}
