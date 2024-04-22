import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';
import { IStorageEvent, IStorageProvider } from './storage-provider.interface';

export interface IStorageExport {
  date: string;
  unlocked: string;
  wingedLights: string;
  favourites: string;
}

export abstract class BaseStorageProvider implements IStorageProvider {
  abstract _lastDate: DateTime<boolean>;
  abstract _syncDate: DateTime<boolean>;

  _unlocked = new Set<string>();
  _wingedLights = new Set<string>();
  _favourites = new Set<string>();

  events = new Subject<IStorageEvent>();

  abstract load(): Observable<void>;
  abstract save(): Observable<void>;

  _debouncer?: number;
  protected _debounceTime = 500;

  getSyncDate(): DateTime<boolean> {
    return this._syncDate;
  }

  isOutOfSync(): boolean {
    return this._lastDate > this._syncDate;
  }

  getUnlocked(): ReadonlySet<string> {
    return this._unlocked;
  }

  addUnlocked(...guids: Array<string>): void {
    for (const guid of guids) {
      this._unlocked.add(guid);
    }
    this.debounceSave();
  }

  removeUnlocked(...guids: Array<string>): void {
    for (const guid of guids) {
      this._unlocked.delete(guid);
    }
    this.debounceSave();
  }

  isUnlocked(guid: string): boolean {
    return this._unlocked.has(guid);
  }

  getWingedLights(): ReadonlySet<string> {
    return this._wingedLights;
  }

  addWingedLights(...guids: Array<string>): void {
    for (const guid of guids) {
      this._wingedLights.add(guid);
    }
    this.debounceSave();
  }

  removeWingedLights(...guids: Array<string>): void {
    for (const guid of guids) {
      this._wingedLights.delete(guid);
    }
    this.debounceSave();
  }

  hasWingedLight(guid: string): boolean {
    return this._wingedLights.has(guid);
  }

  getFavourites(): ReadonlySet<string> {
    return this._favourites;
  }

  addFavourites(...guids: Array<string>): void {
    for (const guid of guids) {
      this._favourites.add(guid);
    }
    this.debounceSave();
  }

  removeFavourites(...guids: Array<string>): void {
    for (const guid of guids) {
      this._favourites.delete(guid);
    }
    this.debounceSave();
  }

  isFavourite(guid: string): boolean {
    return this._favourites.has(guid);
  }

  exportData(): IStorageExport {
    return {
      date: this._lastDate.toISO()!,
      unlocked: [...this.getUnlocked()].join(','),
      wingedLights: [...this.getWingedLights()].join(','),
      favourites: [...this.getFavourites()].join(',')
    };
  }

  importData(data: IStorageExport): void {
    this._lastDate = data.date ? DateTime.fromISO(data.date) : DateTime.now();
    this._syncDate = this._lastDate;
    this._unlocked = new Set(data.unlocked?.length ? data.unlocked.split(',') : []);
    this._wingedLights = new Set(data.wingedLights?.length ? data.wingedLights.split(',') : []);
    this._favourites = new Set(data.favourites?.length ? data.favourites.split(',') : []);
    this.debounceSave();
  }

  protected dispose(): void {
    this._debouncer && clearTimeout(this._debouncer);
  }

  private debounceSave(): void {
    this._lastDate = DateTime.now();

    if (this._debounceTime < 0) {
      this.save().subscribe();
      return;
    }

    if (this._debouncer) {
      clearTimeout(this._debouncer);
    }

    this._debouncer = setTimeout(() => {
      this.save().subscribe();
    }, this._debounceTime);
  }
}
