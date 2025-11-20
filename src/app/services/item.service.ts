import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { IItem, ItemType } from 'skygame-data';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  _typeItems?: { [key: string]: Array<IItem> };
  constructor(
    private readonly _dataService: DataService
  ) {

  }

  getByType(type: ItemType): Array<IItem> {
    if (!this._typeItems) {
      this._typeItems = {};
      for (const item of this._dataService.itemConfig.items) {
        if (!this._typeItems[item.type]) { this._typeItems[item.type] = []; }
        this._typeItems[item.type].push(item);
      }
    }

    return this._typeItems[type] || [];
  }
}
