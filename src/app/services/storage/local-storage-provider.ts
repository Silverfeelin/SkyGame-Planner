import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';

const storageKeys = {
  date: 'date',
  unlocked: 'unlocked',
  wingedLights: 'wingedLights',
  favourites: 'favourites'
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
    this.importData({ date, unlocked, wingedLights, favourites });
    return of(undefined);
  }

  override save(): Observable<void> {
    this.events.next({ type: 'save_start' });
    const data = this.exportData();
    localStorage.setItem(storageKeys.date, this._lastDate.toISO()!);
    localStorage.setItem(storageKeys.unlocked, data.unlocked);
    localStorage.setItem(storageKeys.wingedLights, data.wingedLights);
    localStorage.setItem(storageKeys.favourites, data.favourites);
    this._syncDate = this._lastDate;
    this.events.next({ type: 'save_success' });
    return of(undefined);
  }
}
