import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { BaseStorageProvider } from './base-storage-provider';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageProvider extends BaseStorageProvider {
  private readonly _storageKeys = {
    date: 'date',
    unlocked: 'unlocked',
    wingedLights: 'wingedLights',
    favourites: 'favourites'
  };

  constructor() {
    super();
    this._debounceTime = 0;
  }

  override _lastDate = DateTime.now();
  override _syncDate = DateTime.now();
  override _unlocked = new Set<string>();
  override _favourites = new Set<string>();

  override load(): Observable<void> {
    const date = localStorage.getItem(this._storageKeys.date) || '';
    const unlocked = localStorage.getItem(this._storageKeys.unlocked) || '';
    const wingedLights = localStorage.getItem(this._storageKeys.wingedLights) || '';
    const favourites = localStorage.getItem(this._storageKeys.favourites) || '';
    this.importData({ date, unlocked, wingedLights, favourites });
    return of(undefined);
  }

  override save(): Observable<void> {
    this.events.next({ type: 'save_start' });
    const data = this.exportData();
    localStorage.setItem(this._storageKeys.date, this._lastDate.toISO());
    localStorage.setItem(this._storageKeys.unlocked, data.unlocked);
    localStorage.setItem(this._storageKeys.wingedLights, data.wingedLights);
    localStorage.setItem(this._storageKeys.favourites, data.favourites);
    this._syncDate = this._lastDate;
    this.events.next({ type: 'save_success' });
    return of(undefined);
  }
}
