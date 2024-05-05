import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';

const storageKeys = {
  date: 'date',
  unlocked: 'unlocked',
  wingedLights: 'wingedLights',
  favourites: 'favourites',
  mapMarkers: 'mapMarkers',
  keys: 'data'
};

@Injectable({
  providedIn: 'root'
})
export class LocalStorageProvider extends BaseStorageProvider {
  readonly _name = 'Local Storage';

  override _lastDate: DateTime;
  override _syncDate: DateTime;
  override _unlocked = new Set<string>();
  override _favourites = new Set<string>();

  constructor() {
    super();

    const date = DateTime.now();
    this._lastDate = date;
    this._syncDate = date;
    this._debounceTime = 0;
  }

  override load(): Observable<void> {
    const date = localStorage.getItem(storageKeys.date) || '';
    const unlocked = localStorage.getItem(storageKeys.unlocked) || '';
    const wingedLights = localStorage.getItem(storageKeys.wingedLights) || '';
    const favourites = localStorage.getItem(storageKeys.favourites) || '';
    const mapMarkers = localStorage.getItem(storageKeys.mapMarkers) || '';
    const data = JSON.parse(localStorage.getItem(storageKeys.keys) || '{}');
    this.import({ date, unlocked, wingedLights, favourites, mapMarkers, keys: data });
    return of(undefined);
  }

  override save(force: boolean): Observable<void> {
    this.events.next({ type: 'save_start' });
    const data = this.export();
    localStorage.setItem(storageKeys.date, this._lastDate.toISO()!);
    localStorage.setItem(storageKeys.unlocked, data.unlocked);
    localStorage.setItem(storageKeys.wingedLights, data.wingedLights);
    localStorage.setItem(storageKeys.favourites, data.favourites);
    localStorage.setItem(storageKeys.mapMarkers, data.mapMarkers);
    localStorage.setItem(storageKeys.keys, JSON.stringify(data.keys));
    this._syncDate = this._lastDate;
    this.events.next({ type: 'save_success' });
    return of(undefined);
  }
}
