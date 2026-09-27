import { Injectable, OnDestroy, inject } from '@angular/core';
import { IItem, ItemType } from 'skygame-data';
import { DataService } from '../data.service';
import { IconService } from '../icon.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { ClosetImportReference, ClosetImportRequest, ClosetImportResponse } from './messages';
import type { GridHint } from './grid';
import { ScreenshotMatch, combineBatch } from './batch';

type WorkerRequest = ClosetImportRequest extends infer R ? R extends unknown ? Omit<R, 'id'> : never : never;

export interface ClosetImportResult {
  type: ItemType;
  /** Items of the type in closet order; indices in `shots` refer to this list. */
  items: Array<IItem>;
  /** Per screenshot in upload order; null when no closet grid was found. */
  shots: Array<ScreenshotMatch | null>;
  /** Matched items that can't be previews. */
  owned: Array<IItem>;
  /** Matched items the closet may show without being owned, with a guess from how the tile looks. */
  checklist: Array<{ item: IItem, looksOwned: boolean }>;
  /** Tiles that need the user, with ranked candidates from their order window. */
  ask: Array<{ shot: number, cell: [number, number], window: Array<IItem>, candidates: Array<IItem> }>;
  /** Items missing between confident matches: likely not owned, offered to the user as such. */
  gaps: Array<IItem>;
}

/** Recognises owned cosmetics in closet screenshots. The image work runs in a web worker. */
@Injectable({
  providedIn: 'root'
})
export class ClosetImportService implements OnDestroy {
  private readonly _data = inject(DataService);
  private readonly _icons = inject(IconService);

  private _worker?: Worker;
  private _nextId = 0;
  private readonly _pending = new Map<number, { resolve: (r: ClosetImportResponse) => void, reject: (e: Error) => void }>();
  private _preparedType?: ItemType;
  private _items: Array<IItem> = [];

  static isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
  }

  ngOnDestroy(): void {
    this._worker?.terminate();
  }

  /** Items of a type in the order the closet lists them. */
  getItems(type: ItemType): Array<IItem> {
    return this._data.itemConfig.items.filter(i => i.type === type && i.icon && this._icons.getIcon(i.icon)).sort(ItemHelper.sorter);
  }

  /** Builds reference features for the type in the worker; screenshots of a batch are all of one closet tab. */
  async prepare(type: ItemType): Promise<void> {
    if (this._preparedType === type) { return; }
    const items = this.getItems(type);
    const ongoing = ItemHelper.getOngoingItems(this._data);
    const references: Array<ClosetImportReference> = items.map(item => {
      const icon = this._icons.getIcon(item.icon!)!;
      return { sheet: new URL(icon.url, location.origin).href, x: icon.x, y: icon.y, ongoing: !!ongoing[item.guid] };
    });
    this._preparedType = undefined;
    await this.send({ kind: 'prepare', references });
    this._preparedType = type;
    this._items = items;
  }

  /** Matches one screenshot against the prepared type. `hint` is the grid of the previous screenshot in the batch. */
  async process(file: Blob, hint?: GridHint): Promise<ScreenshotMatch | null> {
    const response = await this.send({ kind: 'process', file, hint });
    return response.kind === 'processed' ? response.result : null;
  }

  /** Processes the screenshots of one closet tab in order and combines them. */
  async importBatch(type: ItemType, files: Array<Blob>, onProgress?: (done: number, total: number) => void): Promise<ClosetImportResult> {
    await this.prepare(type);
    const shots: Array<ScreenshotMatch | null> = [];
    let hint: GridHint | undefined;
    for (const file of files) {
      const shot = await this.process(file, hint);
      shots.push(shot);
      if (shot) { hint = { px: shot.grid.px, py: shot.grid.py, ox: shot.grid.ox }; }
      onProgress?.(shots.length, files.length);
    }
    return this.combine(type, shots);
  }

  /** Batch result from already processed screenshots, e.g. after the user corrected a tile. */
  combine(type: ItemType, shots: Array<ScreenshotMatch | null>): ClosetImportResult {
    const items = this._preparedType === type ? this._items : this.getItems(type);
    const ongoing = ItemHelper.getOngoingItems(this._data);
    const batch = combineBatch(shots, items.map(i => !!ongoing[i.guid]));
    return {
      type, items, shots,
      owned: batch.owned.map(r => items[r]),
      checklist: batch.checklist.map(c => ({ item: items[c.item], looksOwned: c.looksOwned })),
      ask: batch.ask.map(a => ({ shot: a.shot, cell: a.cell, window: items.slice(a.window[0], a.window[1]), candidates: a.candidates.map(r => items[r]) })),
      gaps: batch.gaps.map(r => items[r])
    };
  }

  private send(request: WorkerRequest): Promise<ClosetImportResponse> {
    const worker = this._worker ??= this.createWorker();
    const id = this._nextId++;
    return new Promise<ClosetImportResponse>((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      worker.postMessage({ ...request, id } as ClosetImportRequest);
    });
  }

  private createWorker(): Worker {
    const worker = new Worker(new URL('./closet-import.worker', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }: MessageEvent<ClosetImportResponse>) => {
      const pending = this._pending.get(data.id);
      this._pending.delete(data.id);
      if (data.kind === 'error') { pending?.reject(new Error(data.message)); } else { pending?.resolve(data); }
    };
    worker.onerror = e => {
      const error = new Error(e.message || 'Closet import worker failed.');
      this._pending.forEach(p => p.reject(error));
      this._pending.clear();
      this._worker?.terminate();
      this._worker = undefined;
      this._preparedType = undefined;
    };
    return worker;
  }
}
