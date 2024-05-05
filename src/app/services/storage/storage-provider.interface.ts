import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';

export type StorageEventType =
  'save_start' | 'save_success' | 'save_error' |
  'data_changed';

export interface IStorageEvent {
  type: StorageEventType;
  error?: Error;
}

export interface IStorageExport {
  date: string;
  unlocked: string;
  wingedLights: string;
  favourites: string;
  mapMarkers: string;
  keys: { [key: string]: unknown };
}

export interface IStorageProvider {
  _lastDate: DateTime;
  _syncDate: DateTime;
  _unlocked: Set<string>;
  _favourites: Set<string>;
  _mapMarkers: Set<string>;
  _keys: { [key: string]: unknown };

  events: Subject<IStorageEvent>;

  getName(): string;

  load(): Observable<void>;
  save(force: boolean): Observable<void>;
  import(data: IStorageExport): void;
  export(): IStorageExport;
  getSyncDate(): DateTime;
  isOutOfSync(): boolean;

  getUnlocked(): ReadonlySet<string>;
  addUnlocked(...guids: Array<string>): void;
  removeUnlocked(...guids: Array<string>): void;
  isUnlocked(guid: string): boolean;

  getWingedLights(): ReadonlySet<string>;
  addWingedLights(...guids: Array<string>): void;
  removeWingedLights(...guids: Array<string>): void;
  hasWingedLight(guid: string): boolean;

  getFavourites(): ReadonlySet<string>;
  addFavourites(...guids: Array<string>): void;
  removeFavourites(...guids: Array<string>): void;
  isFavourite(guid: string): boolean;

  getMapMarkers(): ReadonlySet<string>;
  addMapMarkers(...guids: Array<string>): void;
  removeMapMarkers(...guids: Array<string>): void;
  hasMapMarker(guid: string): boolean;

  setKey<T>(key: string, value: T): void;
  getKey<T>(key: string): T | undefined;
}
