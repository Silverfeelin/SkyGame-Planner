import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';

export const storageReloadKeys = new Set(['unlocked', 'favourites', 'col.unlocked']);

export interface IStorageData {
  date: string;
  unlocked: string;
  favourites: string;
  col: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  unlocked = new Set<string>();
  favourites = new Set<string>();
  unlockedCol = new Set<string>();
  lastDate?: dayjs.Dayjs;

  storageChanged = new Subject<StorageEvent>();

  constructor() {
    this.initializeFromStorage();
    this.subscribeStorage();
  }

  private initializeFromStorage(): void {
    const date = localStorage.getItem('date') || '';
    const unlocked = localStorage.getItem('unlocked') || '';
    const favourites = localStorage.getItem('favourites') || '';
    const unlockedCol = localStorage.getItem('col.unlocked') || '';

    this.initializeDate(date);
    this.initializeUnlocked(unlocked);
    this.initializeFavourites(favourites);
    this.initializeCol(unlockedCol);
  }

  getStorageData(): IStorageData {
    return {
      date: this.lastDate?.toISOString() || '',
      unlocked: this.serializeUnlocked(),
      favourites: this.serializeFavourites(),
      col: this.serializeUnlockedCol()
    };
  }

  // #region Date

  private initializeDate(isoDate: string): void {
    this.lastDate = isoDate ? dayjs(isoDate) : dayjs();
  }

  private updateDate(): void {
    this.lastDate = dayjs();
    localStorage.setItem('date', this.lastDate.toISOString());
  }

  // #endregion

  // #region Nodes & items

  private initializeUnlocked(unlocked: string): void {
    this.unlocked.clear();
    const guids: Array<string> = unlocked?.length && unlocked.split(',') || [];
    guids.forEach(g => this.unlocked.add(g));
  }

  private initializeFavourites(favourites: string): void {
    this.favourites.clear();
    const favGuids: Array<string> = favourites?.length && favourites.split(',') || [];
    favGuids.forEach(g => this.favourites.add(g));
  }

  /** Adds unlocked node or items by GUID. */
  add(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.add(g));
  }

  /** Removes nodes or items by GUID. */
  remove(...guids: Array<string>): void {
    guids?.forEach(g => this.unlocked.delete(g));
  }

  serializeUnlocked(): string {
    return [...this.unlocked].join(',');
  }

  save(): void {
    const unlocked = this.serializeUnlocked();
    localStorage.setItem('unlocked', unlocked);
    this.updateDate();
  }

  // #endregion

  // #region Favourites

  addFavourite(...guids: Array<string>): void {
    guids?.forEach(g => this.favourites.add(g));
  }

  removeFavourite(...guids: Array<string>): void {
    guids?.forEach(g => this.favourites.delete(g));
  }

  serializeFavourites(): string {
    return [...this.favourites].join(',');
  }

  saveFavourites(): void {
    const favourites = this.serializeFavourites();
    localStorage.setItem('favourites', favourites);
    this.updateDate();
  }

  // #endregion

  // #region Children of Light

  private initializeCol(unlockedCol: string): void {
    this.unlockedCol.clear();
    const colGuids: Array<string> = unlockedCol?.length && unlockedCol.split(',') || [];
    colGuids.forEach(g => this.unlockedCol.add(g));
  }

  addCol(...guids: Array<string>): void {
    guids?.forEach(g => this.unlockedCol.add(g));
  }

  removeCol(...guids: Array<string>): void {
    guids?.forEach(g => this.unlockedCol.delete(g));
  }

  serializeUnlockedCol(): string {
    return [...this.unlockedCol].join(',');
  }

  saveCol(): void {
    const unlocked = this.serializeUnlockedCol();
    localStorage.setItem('col.unlocked', unlocked);
    this.updateDate();
  }

  // #endregion

  // #region Storage updates

  private subscribeStorage(): void {
    window.addEventListener('storage', evt => {
      this.onStorageChanged(evt);
    });
  }

  private onStorageChanged(event: StorageEvent): void {
    this.storageChanged.next(event);
  }

  // #endregion
}
