import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';
import { IStorageEvent, IStorageExport, IStorageProvider } from './storage-provider.interface';

export abstract class BaseStorageProvider implements IStorageProvider {
  abstract _name: string;
  abstract _lastDate: DateTime<boolean>;
  abstract _syncDate: DateTime<boolean>;

  _unlocked = new Set<string>();
  _wingedLights = new Set<string>();
  _favourites = new Set<string>();
  _keys: { [key: string]: unknown } = {};

  events = new Subject<IStorageEvent>();

  abstract load(): Observable<void>;
  abstract save(force: boolean): Observable<void>;

  _debouncer?: number;
  protected _debounceTime = 500;

  getName(): string {
    return this._name;
  }

  import(data: IStorageExport): void {
    this._lastDate = data.date ? DateTime.fromISO(data.date) : DateTime.now();
    this._syncDate = this._lastDate;
    this._unlocked = new Set(data.unlocked?.length ? data.unlocked.split(',') : []);
    this._wingedLights = new Set(data.wingedLights?.length ? data.wingedLights.split(',') : []);
    this._favourites = new Set(data.favourites?.length ? data.favourites.split(',') : []);
    this._keys = data.keys || {};
  }

  export(): IStorageExport {
    return {
      date: this._lastDate.toISO()!,
      unlocked: [...this.getUnlocked()].join(','),
      wingedLights: [...this.getWingedLights()].join(','),
      favourites: [...this.getFavourites()].join(','),
      keys: this._keys
    };
  }

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
    this._lastDate = DateTime.now();
    this.debounceSave();
  }

  removeUnlocked(...guids: Array<string>): void {
    for (const guid of guids) {
      this._unlocked.delete(guid);
    }
    this._lastDate = DateTime.now();
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
    this._lastDate = DateTime.now();
    this.debounceSave();
  }

  removeWingedLights(...guids: Array<string>): void {
    for (const guid of guids) {
      this._wingedLights.delete(guid);
    }
    this._lastDate = DateTime.now();
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
    this._lastDate = DateTime.now();
    this.debounceSave();
  }

  removeFavourites(...guids: Array<string>): void {
    for (const guid of guids) {
      this._favourites.delete(guid);
    }
    this._lastDate = DateTime.now();
    this.debounceSave();
  }

  isFavourite(guid: string): boolean {
    return this._favourites.has(guid);
  }

  setKey<T>(key: string, value: T): void {
    this._keys[key] = value;
    this._lastDate = DateTime.now();
    this.debounceSave();
  }

  getKey<T>(key: string): T | undefined {
    return this._keys[key] as T;
  }

  protected dispose(): void {
    this._debouncer && clearTimeout(this._debouncer);
  }

  private debounceSave(): void {
    if (this._debounceTime < 0) {
      this.save(false).subscribe();
      return;
    }

    if (this._debouncer) {
      clearTimeout(this._debouncer);
    }

    this._debouncer = setTimeout(() => {
      this.save(false).subscribe();
    }, this._debounceTime);
  }
}
