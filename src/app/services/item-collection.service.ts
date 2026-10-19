import { Injectable, inject } from '@angular/core';
import { IItem } from 'skygame-data';
import { DataService } from './data.service';
import { StorageService } from './storage.service';

export interface IItemCollection {
  guid: string;
  name: string;
  description: string;
  imageUrl: string;
  items: Array<IItem>;
}

interface IStorageData {
  collections: Array<{ guid: string, name: string, description: string, imageUrl?: string, items: string }>;
}

const STORAGE_KEY = 'item.collections';

@Injectable({ providedIn: 'root' })
export class ItemCollectionService {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);

  load(): Array<IItemCollection> {
    const data = this._storageService.getKey<IStorageData>(STORAGE_KEY);
    return (data?.collections || []).map(c => ({
      guid: c.guid, name: c.name, description: c.description, imageUrl: c.imageUrl || '',
      items: c.items?.split(',').map(guid => this._dataService.guidMap.get(guid) as IItem).filter(i => i) || []
    }));
  }

  save(collections: Array<IItemCollection>): void {
    this._storageService.setKey<IStorageData>(STORAGE_KEY, {
      collections: collections.map(c => ({
        guid: c.guid, name: c.name, description: c.description, imageUrl: c.imageUrl,
        items: c.items.map(i => i.guid).join(',')
      }))
    });
  }

  get(guid: string): IItemCollection | undefined {
    return this.load().find(c => c.guid === guid);
  }

  /** Replaces the collection with the same guid, or adds it to the end. */
  upsert(collection: IItemCollection): void {
    const collections = this.load();
    const index = collections.findIndex(c => c.guid === collection.guid);
    index >= 0 ? collections[index] = collection : collections.push(collection);
    this.save(collections);
  }

  /** Finds a collection containing exactly these items, regardless of order. */
  findByItems(items: ReadonlyArray<IItem>): IItemCollection | undefined {
    if (!items.length) { return undefined; }
    const guids = new Set(items.map(i => i.guid));
    return this.load().find(c => {
      const stored = new Set(c.items.map(i => i.guid));
      return stored.size === guids.size && [...stored].every(g => guids.has(g));
    });
  }

  serialize(collections: Array<IItemCollection>): string {
    return JSON.stringify(collections.map(c => ({
      guid: c.guid,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      items: c.items.map(i => i.guid)
    })), null, 2);
  }

  deserialize(json: string): Array<IItemCollection> {
    const collections = JSON.parse(json);
    if (!Array.isArray(collections)) { throw new Error('Invalid collection data.'); }
    return collections.map(c => ({
      guid: c.guid,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      items: c.items.map((guid: string) => this._dataService.guidMap.get(guid) as IItem).filter((i: IItem) => i)
    }));
  }
}
