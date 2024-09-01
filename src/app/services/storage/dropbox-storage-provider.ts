import { DateTime } from 'luxon';
import { Observable, concatMap, of } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';
import { DropboxService } from '../dropbox.service';
import { IStorageCurrencies } from './storage-provider.interface';

interface IDropboxData {
  date: string;
  currencies: IStorageCurrencies;
  unlocked: string;
  wingedLights: string;
  favourites: string;
  seasonPasses: string;
  gifted: string;
  mapMarkers: string;
  keys: { [key: string]: unknown };
}

@Injectable({
  providedIn: 'root'
})
export class DropboxStorageProvider extends BaseStorageProvider implements OnDestroy {
  readonly _name = 'Dropbox';

  override _lastDate: DateTime;
  override _syncDate: DateTime;

  private _rev?: string;

  constructor(
    private readonly _dropboxService: DropboxService
  ) {
    super();

    const date = DateTime.fromObject({ year: 2000, month: 1, day: 1 });
    this._lastDate = date;
    this._syncDate = date;
    this._debounceTime = 3000;
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  override load(): Observable<void> {
    return new Observable<void>(observer => {
      this._dropboxService.initialize();
      this._dropboxService.downloadFile('/data.json').then(data => {
        this.onData(data);
        observer.next();
        observer.complete();
      }).catch(e => {
        // Accept file not found since it's created on first save.
        const err = e.error as any;
        if (err?.error?.['.tag'] === 'path' && err.error['path']?.['.tag'] === 'not_found') {
          this.onData({});
          observer.next();
          observer.complete();
          return;
        }
        observer.error(e);
      });
    });
  }

  override save(force: boolean): Observable<void> {
    this.events.next({ type: 'save_start' });
    return new Observable<void>(observer => {
      this._dropboxService.initialize();
      const rev = !force ? this._rev : undefined;
      this._dropboxService.uploadFile('/data.json', JSON.stringify(this.serializeData()), rev).then(data => {
        if (this._syncDate <= this._lastDate) { this._syncDate = this._lastDate; }
        this._rev = data.rev;
        observer.next();
        observer.complete();
        this.events.next({ type: 'save_success' });
      }).catch(e => {
        e = this.parseDropboxError(e) || e;
        observer.error(e);
        this.events.next({ type: 'save_error', error: e });
      });
    });
  }

  private onData(data: Partial<IDropboxData>): void {
    this.initializeData(data);
  }

  private initializeData(data: Partial<IDropboxData>): void {
    this._syncDate = data.date ? DateTime.fromISO(data.date) as DateTime : DateTime.now();
    this._currencies = data.currencies || { candles: 0, hearts: 0, ascendedCandles: 0, giftPasses: 0, eventCurrencies: {}, seasonCurrencies: {} };;
    this._unlocked = new Set((data.unlocked || undefined)?.split(',') ?? []);
    this._wingedLights = new Set((data.wingedLights || undefined)?.split(',') ?? []);
    this._favourites = new Set((data.favourites || undefined)?.split(',') ?? []);
    this._seasonPasses = new Set((data.seasonPasses || undefined)?.split(',') ?? []);
    this._gifted = new Set((data.gifted || undefined)?.split(',') ?? []);
    this._mapMarkers = new Set((data.mapMarkers || undefined)?.split(',') ?? []);
    this._keys = data.keys || {};
  }

  private serializeData(): IDropboxData {
    return {
      date: this._syncDate.toISO()!,
      currencies: this._currencies,
      unlocked: [...this._unlocked].join(','),
      wingedLights: [...this._wingedLights].join(','),
      favourites: [...this._favourites].join(','),
      seasonPasses: [...this._seasonPasses].join(','),
      gifted: [...this._gifted].join(','),
      mapMarkers: [...this._mapMarkers].join(','),
      keys: this._keys
    };
  }

  private parseDropboxError(e: any): Error | undefined {
    if (!e) { return; }
    if (!e.error?.error) { return; }

    if (e.error.error['.tag'] === 'path' && e.error.error.reason?.['.tag'] === 'conflict') {
      return new Error('Conflict detected. The file has been modified by another tab or device.');
    }

    return undefined;
  }
}
